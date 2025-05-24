import { RisparmioCasaRepository } from '../../core/repositories/RisparmioCasaRepository';
import { generateAuthCode } from '../../utils/utils';
import sendGrid from '../../lib/sendGrid';
import { EmailProvider } from '../../core/models/EmailProvider';
import { mailjetClient } from '../../lib/mailjet';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email } = req.body;
        const { provider } = req.body;
        const risparmioCasaRepository = new RisparmioCasaRepository();

        console.log('Request verification for email', email);

        const authCode = generateAuthCode();

        await risparmioCasaRepository.setVerificationCode(email, authCode);

        if (provider === EmailProvider.SendGrid) {
            const { sendGridClient } = sendGrid;
            const message = {
                from: { name: 'Risparmio Casa', email: 'noreply@cartafedelta.online' },
                replyTo: { email: 'cartafedelta@risparmiocasa.com' },
                templateId: 'd-8e92080be6aa4066b20a060f045cf954',
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
                            Email: 'noreply@cartafedelta.online',
                            Name: 'Risparmio Casa',
                        },
                        To: [{ Email: email }],
                        Subject: 'Risparmio Casa - Autenticazione Carta Fedeltà',
                        TemplateID: 3866301,
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
