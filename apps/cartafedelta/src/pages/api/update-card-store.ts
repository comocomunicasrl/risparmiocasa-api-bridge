import {IPersonDetails} from './../../core/models/IPersonDetails';
import sendGrid from '../../lib/sendGrid';
import {EmailProvider} from '../../core/models/EmailProvider';
import {mailjetClient} from '../../lib/mailjet';
import {RisparmioCasaRepository} from '../../core/repositories/RisparmioCasaRepository';
import axios from 'axios';
import {getGender} from '../../utils/utils';
import {CountryCode, CountryOfResidence} from "../../core/models/enums/Country";
import JsBarcode from 'jsbarcode';
import { createCanvas } from 'canvas';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { provider } = req.body;
        const details = req.body.details as IPersonDetails;
        const risparmioCasaRepository = new RisparmioCasaRepository();

        console.log('Attempting to update card');
        console.log(details);

        const results = await axios.post(process.env.RISPARMIOCASA_UPDATE_CARD_SOAP_URL, {
            details,
            cardNumber: details.cardNumber,
            updateFromStore: true
        });

        if (results.status !== 200) {
            console.log('Received bad status call from SOAP');
            return res.status(400).end();
        }

        await risparmioCasaRepository.updateCard(details);

        if (details.discountCode) {
            const discount = await risparmioCasaRepository.getDiscountCode(details.discountCode);
            if (discount) {
                console.log('Found valid discount code. Applying to the card.');
                const discountAssignmentRes = await axios
                    .post(process.env.RISPARMIOCASA_DISCOUNT_SOAP_URL, {
                        store: details.preferredStoreCode,
                        cardNumber: details.cardNumber,
                        points: discount.value,
                        ean: discount.ean
                    })
                    .then(() => {
                        console.log('Discount code applied');
                        return true;
                    })
                    .catch(() => {
                        console.log('Failed to apply discount code');
                        return false;
                    });
                if (discountAssignmentRes === true) {
                    await risparmioCasaRepository.updateDiscountCodeAssignmentDate(details.email, new Date());
                }
            }
        }

        const canvas = createCanvas(210, 120);
        JsBarcode(canvas, details.cardNumber, { format: 'EAN13', displayValue: false, flat: true });
        const img = canvas.toDataURL().split(';base64,')[1];

        if (provider === EmailProvider.SendGrid) {
            const { sendGridClient } = sendGrid;
            const message = {
                from: { name: 'Risparmio Casa', email: 'noreply@cartafedelta.online' },
                replyTo: { email: 'cartafedelta@risparmiocasa.com' },
                templateId: details.registrationCountry === CountryCode.Malta
                    ? 'd-23883eb1d2c14ea1976440dd70e7a164'
                    : 'd-a1026e5621c741ac8f39e9732183fcff',
                attachments: [
                    {
                        content: img,
                        filename: 'card.jpg',
                        content_id: 'card',
                        disposition: 'inline',
                        type: 'image/jpg',
                    },
                ],
                personalizations: [
                    {
                        to: [{ email: details.email }],
                        dynamic_template_data: {
                            cardNumber: details.cardNumber,
                            name: details.name,
                            surname: details.surname,
                            gender: getGender(details.gender),
                            email: details.email,
                            phoneNumber: details.phoneNumber,
                            phoneNumberSecondary: details.phoneNumberSecondary,
                            country: details.registrationCountry === CountryCode.Malta
                                ? CountryOfResidence.Malta
                                : details.registrationCountry === CountryCode.Switzerland
                                    ? CountryOfResidence.Switzerland
                                    : CountryOfResidence.Italy,
                            city: details.city,
                            postalCode: details.postalCode,
                            address: details.address,
                            streetNumber: details.streetNumber,
                            preferredStore: details.preferredStore,
                            dateOfBirth: `${details.dateOfBirth.year}-${details.dateOfBirth.month}-${details.dateOfBirth.day}`,
                            rules: details.registrationCountry === CountryCode.Malta
                                ? details.rules ? 'YES' : 'NO'
                                : details.rules ? 'SI' : 'NO',
                            marketing: details.registrationCountry === CountryCode.Malta
                                ? details.marketing ? 'YES' : 'NO'
                                : details.marketing ? 'SI' : 'NO',
                            statistics: details.registrationCountry === CountryCode.Malta
                                ? details.statistics ? 'YES' : 'NO'
                                : details.statistics ? 'SI' : 'NO',
                        },
                    },
                ],
            };

            const response = await sendGridClient
                .send(message)
                .then((response) => {
                    console.log(response[0].statusCode);
                    console.log(response[0].headers);
                })
                .catch((error) => {
                    console.error(error);
                });
            console.log(response);
        } else {
            const request = mailjetClient.post('send', { version: 'v3.1' }).request({
                Messages: [
                    {
                        From: {
                            Email: 'noreply@cartafedelta.online',
                            Name: 'Risparmio Casa',
                        },
                        To: [{ Email: details.email }],
                        Subject:
                            details.registrationCountry === CountryCode.Malta
                                ? 'Risparmio Casa - Thank you for requesting the Loyalty Card'
                                : 'Grazie per aver richiesto la Carta Fedeltà Risparmio Casa',
                        InlinedAttachments: [
                            {
                                ContentType: 'image/png',
                                Filename: 'card.png',
                                Base64Content: img,
                                ContentId: 'id1',
                            },
                        ],
                        TemplateID:
                            details.registrationCountry === CountryCode.Malta ? 6538971 : 6538966,
                        TemplateLanguage: true,
                        Variables: {
                            image: `<img width="320" style="display: block; margin: 0 auto;" src="cid:id1" />`,
                            cardNumber: details.cardNumber,
                            name: details.name,
                            surname: details.surname,
                            gender: getGender(details.gender),
                            email: details.email,
                            phoneNumber: details.phoneNumber,
                            phoneNumberSecondary: details.phoneNumberSecondary,
                            country: details.registrationCountry === CountryCode.Malta
                                ? CountryOfResidence.Malta
                                : details.registrationCountry === CountryCode.Switzerland
                                    ? CountryOfResidence.Switzerland
                                    : CountryOfResidence.Italy,
                            city: details.city,
                            postalCode: details.postalCode,
                            address: details.address,
                            streetNumber: details.streetNumber,
                            preferredStore: details.preferredStore,
                            dateOfBirth: `${details.dateOfBirth.year}-${details.dateOfBirth.month}-${details.dateOfBirth.day}`,
                            rules: details.registrationCountry === CountryCode.Malta
                                ? details.rules ? 'YES' : 'NO'
                                : details.rules ? 'SI' : 'NO',
                            marketing: details.registrationCountry === CountryCode.Malta
                                ? details.marketing ? 'YES' : 'NO'
                                : details.marketing ? 'SI' : 'NO',
                            statistics: details.registrationCountry === CountryCode.Malta
                                ? details.statistics ? 'YES' : 'NO'
                                : details.statistics ? 'SI' : 'NO',
                        },
                    },
                ],
            });
            request
                .then((result) => {
                    console.log(result.data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }

        console.log('Updated card', details.cardNumber);

        return res.status(204).end();
    }

    return res.status(404).end();
}
