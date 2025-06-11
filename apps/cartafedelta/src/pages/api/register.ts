import sendGrid from '../../lib/sendGrid';
import { generateAuthCode } from '../../utils/utils';
import { IPersonDetails } from '../../core/models/IPersonDetails';
import { RisparmioCasaRepository } from '../../core/repositories/RisparmioCasaRepository';
import { IDiscountCode } from '../../core/models/IDiscountCode';
import { EmailProvider } from '../../core/models/EmailProvider';
import { mailjetClient } from '../../lib/mailjet';

const emailTemplateMap = {
    rica: { 
        senderName: 'Risparmio Casa',
        senderEmail: 'noreply@cartafedelta.online',
        replyTo: 'cartafedelta@risparmiocasa.com',
        sendgridTemplateIds: {
            it: 'd-8e92080be6aa4066b20a060f045cf954',
            mt: 'd-3d28ee40daca4050a17a4653c1d40c35',
            ch: 'd-8e92080be6aa4066b20a060f045cf954'
        },
        mailjetTemplateIds: {
            it: 3866301,
            mt: 5803997,
            ch: 3866301
        },
        mailjetSubjects: {
            it: 'Risparmio Casa - Autenticazione Carta Fedeltà',
            mt: 'Risparmio Casa - Loyalty Card Authentication',
            ch: 'Risparmio Casa - Autenticazione Carta Fedeltà'
        }
    },
    uniprice: { 
        senderName: 'Uniprice',
        senderEmail: 'noreply@cartafedelta.online',
        replyTo: 'cartafedelta@uniprice.eu',
        sendgridTemplateIds: {
            it: 'd-cd20e4a634f845edb8f5dca6350f36e5',
            mt: '',
            ch: ''
        },
        mailjetTemplateIds: {
            it: 7031672,
            mt: -1,
            ch: -1
        },
        mailjetSubjects: {
            it: 'Uniprice - Autenticazione Carta Fedeltà',
            mt: '',
            ch: ''
        }
    }
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const details = req.body as IPersonDetails;
        const { provider, brand } = req.body;
        const risparmioCasaRepository = new RisparmioCasaRepository(brand);
        console.log(details);

        if (details.discountCode) {
            const discount = await risparmioCasaRepository.getDiscountCode(details.discountCode);
            if (!discount) return res.status(400).end();
            details.discountValue = (discount as IDiscountCode).value;
        }

        const authCode = generateAuthCode();

        if (provider === EmailProvider.SendGrid) {
            const { sendGridClient } = sendGrid;
            const message = {
                from: { name: emailTemplateMap[brand].senderName, email: emailTemplateMap[brand].senderEmail },
                replyTo: { email: emailTemplateMap[brand].replyTo },
                templateId: emailTemplateMap[brand].sendgridTemplateIds[details.registrationCountry],
                personalizations: [
                    {
                        to: [{ email: details.email }],
                        dynamic_template_data: { authCode: authCode },
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
                        To: [{ Email: details.email }],
                        Subject: emailTemplateMap[brand].mailjetSubjects[details.registrationCountry],
                        TemplateID: emailTemplateMap[brand].mailjetTemplateIds[details.registrationCountry],
                        TemplateLanguage: true,
                        Variables: {
                            auth: authCode,
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

        await risparmioCasaRepository.createCard(details, authCode);
        return res.status(204).end();
    }

    return res.status(404).end();
}
