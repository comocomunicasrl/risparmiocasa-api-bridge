import {IPersonDetails} from './../../core/models/IPersonDetails';
import sendGrid from '../../lib/sendGrid';
import {EmailProvider} from '../../core/models/EmailProvider';
import {mailjetClient} from '../../lib/mailjet';
import {RisparmioCasaRepository} from '../../core/repositories/RisparmioCasaRepository';
import axios from 'axios';
import {getGender} from '../../utils/utils';
import {CountryCode, CountryOfResidence} from "../../core/models/enums/Country";

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
            updateFromStore: false
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

        if (provider === EmailProvider.SendGrid) {
            const { sendGridClient } = sendGrid;
            const message = {
                from: { name: 'Risparmio Casa', email: 'noreply@cartafedelta.online' },
                replyTo: { email: 'cartafedelta@risparmiocasa.com' },
                templateId: details.registrationCountry === CountryCode.Malta
                    ? 'd-25bd43b0c091477080306791af7aa565'
                    : 'd-caebece3c04048f5aa503491183c32e8',
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
                                ? 'Risparmio Casa - Loyalty Card Data Update'
                                : 'Aggiornamento dati Carta Fedeltà Risparmio Casa',
                        TemplateID:
                            details.registrationCountry === CountryCode.Malta ? 6367297 : 5766116,
                        TemplateLanguage: true,
                        Variables: {
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
