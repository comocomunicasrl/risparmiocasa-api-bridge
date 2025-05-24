import sendGrid from '../../lib/sendGrid';
import { generateAuthCode } from '../../utils/utils';
import { IPersonDetails } from '../../core/models/IPersonDetails';
import { RisparmioCasaRepository } from '../../core/repositories/RisparmioCasaRepository';
import { IDiscountCode } from '../../core/models/IDiscountCode';
import { EmailProvider } from '../../core/models/EmailProvider';
import { mailjetClient } from '../../lib/mailjet';
import { CountryCode } from '../../core/models/enums/Country';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const risparmioCasaRepository = new RisparmioCasaRepository();
        const details = req.body as IPersonDetails;
        const { provider } = req.body;
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
                from: { name: 'Risparmio Casa', email: 'noreply@cartafedelta.online' },
                replyTo: { email: 'cartafedelta@risparmiocasa.com' },
                templateId:
                    details.registrationCountry === CountryCode.Malta
                        ? 'd-3d28ee40daca4050a17a4653c1d40c35'
                        : 'd-8e92080be6aa4066b20a060f045cf954',
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
                            Email: 'noreply@cartafedelta.online',
                            Name: 'Risparmio Casa',
                        },
                        To: [{ Email: details.email }],
                        Subject:
                            details.registrationCountry === CountryCode.Malta
                                ? 'Risparmio Casa - Loyalty Card Authentication'
                                : 'Risparmio Casa - Autenticazione Carta Fedeltà',
                        TemplateID:
                            details.registrationCountry === CountryCode.Malta ? 5803997 : 3866301,
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
