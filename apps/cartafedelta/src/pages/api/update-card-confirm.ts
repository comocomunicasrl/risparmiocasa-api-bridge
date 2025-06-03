import {IPersonDetails} from './../../core/models/IPersonDetails';
import sendGrid from '../../lib/sendGrid';
import {EmailProvider} from '../../core/models/EmailProvider';
import {mailjetClient} from '../../lib/mailjet';
import {RisparmioCasaRepository} from '../../core/repositories/RisparmioCasaRepository';
import axios from 'axios';
import {getGender} from '../../utils/utils';
import {CountryCode, CountryOfResidence} from "../../core/models/enums/Country";

const emailTemplateMap = {
    rica: { 
        senderName: 'Risparmio Casa',
        senderEmail: 'noreply@cartafedelta.online',
        replyTo: 'cartafedelta@risparmiocasa.com',
        sendGridTemplateIds: {
            it: 'd-caebece3c04048f5aa503491183c32e8',
            mt: 'd-25bd43b0c091477080306791af7aa565',
            ch: 'd-caebece3c04048f5aa503491183c32e8'
        },
        mailjetTemplateIds: {
            it: 5766116,
            mt: 6367297,
            ch: 5766116
        },
        mailjetSubjects: {
            it: 'Aggiornamento dati Carta Fedeltà Risparmio Casa',
            mt: 'Risparmio Casa - Loyalty Card Data Update',
            ch: 'Aggiornamento dati Carta Fedeltà Risparmio Casa'
        }
    },
    uniprice: { 
        senderName: 'Uniprice',
        senderEmail: 'noreply@cartafedelta.online',
        replyTo: 'cartafedelta@uniprice.eu',
        sendgridTemplateIds: {
            it: 'd-a58dcf3ed7694932a27704ae3ceac45a',
            mt: '',
            ch: ''
        },
        mailjetTemplateIds: {
            it: 7031686,
            mt: -1,
            ch: -1
        },
        mailjetSubjects: {
            it: 'Aggiornamento dati Carta Fedeltà Uniprice',
            mt: 'Uniprice - Loyalty Card Data Update',
            ch: 'Aggiornamento dati Carta Fedeltà Uniprice'
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
            details,
            cardNumber: details.cardNumber,
            updateFromStore: false,
            brand
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
                        ean: discount.ean,
                        brand
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
                from: { name: emailTemplateMap[brand].senderName, email: emailTemplateMap[brand].senderEmail },
                replyTo: { email: emailTemplateMap[brand].replyTo },
                templateId: emailTemplateMap[brand].sendgridTemplateIds[details.registrationCountry],
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
