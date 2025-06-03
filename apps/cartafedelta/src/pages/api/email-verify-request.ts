import { RisparmioCasaRepository } from '../../core/repositories/RisparmioCasaRepository';
import { generateAuthCode } from '../../utils/utils';
import sendGrid from '../../lib/sendGrid';
import { EmailProvider } from '../../core/models/EmailProvider';
import { mailjetClient } from '../../lib/mailjet';

const emailTemplateMap = {
    rica: { 
        senderName: 'Risparmio Casa',
        senderEmail: 'noreply@cartafedelta.online',
        replyTo: 'cartafedelta@risparmiocasa.com',
        sendgridTemplateId: 'd-8e92080be6aa4066b20a060f045cf954',
        mailjetTemplateId: 3866301,
        mailjetSubject: 'Risparmio Casa - Autenticazione Carta Fedeltà'
    },
    uniprice: { 
        senderName: 'Uniprice',
        senderEmail: 'noreply@cartafedelta.online',
        replyTo: 'cartafedelta@uniprice.eu',
        sendgridTemplateId: 'd-cd20e4a634f845edb8f5dca6350f36e5',
        mailjetTemplateId: 7031672,
        mailjetSubject: 'Uniprice - Autenticazione Carta Fedeltà'
    }
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email, brand, provider } = req.body;
        const risparmioCasaRepository = new RisparmioCasaRepository(brand);

        console.log('Request verification for email', email);

        const authCode = generateAuthCode();

        await risparmioCasaRepository.setVerificationCode(email, authCode);

        if (provider === EmailProvider.SendGrid) {
            const { sendGridClient } = sendGrid;
            const message = {
                from: { name: emailTemplateMap[brand].senderName, email: emailTemplateMap[brand].senderEmail },
                replyTo: { email: emailTemplateMap[brand].replyTo },
                templateId: emailTemplateMap[brand].sendgridTemplateId,
                personalizations: [
                    {
                        to: [{ email }],
                        dynamic_template_data: { authCode },
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
                        To: [{ Email: email }],
                        Subject: emailTemplateMap[brand].mailjetSubject,
                        TemplateID: emailTemplateMap[brand].senderEmail,
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

        return res.status(200).end();
    }

    return res.status(404).end();
}
