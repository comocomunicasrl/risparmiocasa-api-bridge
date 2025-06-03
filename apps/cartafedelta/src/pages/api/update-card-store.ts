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

const emailTemplateMap = {
    rica: { 
        senderName: 'Risparmio Casa',
        senderEmail: 'noreply@cartafedelta.online',
        replyTo: 'cartafedelta@risparmiocasa.com',
        sendGridTemplateIds: {
            it: 'd-a1026e5621c741ac8f39e9732183fcff',
            mt: 'd-23883eb1d2c14ea1976440dd70e7a164',
            ch: 'd-a1026e5621c741ac8f39e9732183fcff'
        },
        mailjetTemplateIds: {
            it: 6538966,
            mt: 6538971,
            ch: 6538966
        },
        mailjetSubjects: {
            it: 'Grazie per aver richiesto la Carta Fedeltà Risparmio Casa',
            mt: 'Risparmio Casa - Thank you for requesting the Loyalty Card',
            ch: 'Grazie per aver richiesto la Carta Fedeltà Risparmio Casa'
        }
    },
    uniprice: { 
        senderName: 'Uniprice',
        senderEmail: 'noreply@cartafedelta.online',
        replyTo: 'cartafedelta@uniprice.eu',
        sendgridTemplateIds: {
            it: 'd-0d242e18ef764468bc729d45bfc5afb0',
            mt: '',
            ch: ''
        },
        mailjetTemplateIds: {
            it: 7031720,
            mt: -1,
            ch: -1
        },
        mailjetSubjects: {
            it: 'Grazie per aver richiesto la Carta Fedeltà Uniprice',
            mt: 'Uniprice - Thank you for requesting the Loyalty Card',
            ch: 'Grazie per aver richiesto la Carta Fedeltà Uniprice'
        }
    }
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { provider, brand } = req.body;
        const details = req.body.details as IPersonDetails;
        const risparmioCasaRepository = new RisparmioCasaRepository(brand);

        console.log('Attempting to update card');
        console.log(details);

        const results = await axios.post(process.env.RISPARMIOCASA_UPDATE_CARD_SOAP_URL, {
            brand,
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
                        brand,
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
                from: { name: emailTemplateMap[brand].senderName, email: emailTemplateMap[brand].senderEmail },
                replyTo: { email: emailTemplateMap[brand].replyTo },
                templateId: emailTemplateMap[brand].sendgridTemplateIds[details.registrationCountry],
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
                            Email: emailTemplateMap[brand].senderEmail,
                            Name: emailTemplateMap[brand].senderName,
                        },
                        Subject: emailTemplateMap[brand].mailjetSubjects[details.registrationCountry],
                        TemplateID: emailTemplateMap[brand].mailjetTemplateIds[details.registrationCountry],
                        To: [{ Email: details.email }],
                        InlinedAttachments: [
                            {
                                ContentType: 'image/png',
                                Filename: 'card.png',
                                Base64Content: img,
                                ContentId: 'id1',
                            },
                        ],
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
