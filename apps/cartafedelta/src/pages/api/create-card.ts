import axios from 'axios';
import sendGrid from '../../lib/sendGrid';
import { RisparmioCasaRepository } from '../../core/repositories/RisparmioCasaRepository';
import JsBarcode from 'jsbarcode';
import { EmailProvider } from '../../core/models/EmailProvider';
import { mailjetClient } from '../../lib/mailjet';
import { CountryCode } from '../../core/models/enums/Country';
import { createCanvas } from 'canvas';

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const { details } = req.body;
        console.log(details);
        await axios.post(process.env.RISPARMIOCASA_CREATE_CARD_SOAP_URL.replace('create-card', 'create-card-temp'), {
            details,
        });
        return res.status(200).end();
    } else if (req.method === 'POST') {
        const { details } = req.body;
        const { provider } = req.body;
        const risparmioCasaRepository = new RisparmioCasaRepository();

        if (await risparmioCasaRepository.cardAlreadyExists(details.email)) {
            console.log('Card already exists for this email.');
            return res.status(400).end();
        }

        if (!(await risparmioCasaRepository.isVerifiedEmail(details.email))) {
            console.log('Email not verified.');
            return res.status(400).end();
        }

        console.log(details);
        const results = await axios.post(process.env.RISPARMIOCASA_CREATE_CARD_SOAP_URL, {
            details,
        }).catch(function (error) {
            console.log(error);
            return res.status(500).send(error);
        });

        if (results.status !== 200) {
            console.log('Received bad status call from SOAP');
            return res.status(400).end();
        }

        const data = results.data;
        console.log(`Card created ${data.cardNumber}`);

        await risparmioCasaRepository.registerCard(details.email, data.cardNumber);

        if (details.discountCode) {
            const discount = await risparmioCasaRepository.getDiscountCode(details.discountCode);
            if (discount) {
                console.log('Found valid discount code. Applying to the card.');
                const discountAssignmentRes = await axios
                    .post(process.env.RISPARMIOCASA_DISCOUNT_SOAP_URL, {
                        store: details.preferredStoreCode,
                        cardNumber: data.cardNumber,
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
        JsBarcode(canvas, data.cardNumber, { format: 'EAN13', displayValue: false, flat: true });
        const img = canvas.toDataURL().split(';base64,')[1];

        if (provider === EmailProvider.SendGrid) {
            console.log('Sending new card email with Sendgrid.');
            const { sendGridClient } = sendGrid;
            const message = {
                from: { name: 'Risparmio Casa', email: 'noreply@cartafedelta.online' },
                replyTo: { email: 'cartafedelta@risparmiocasa.com' },
                templateId:
                    details.registrationCountry === CountryCode.Malta
                        ? 'd-5e29ba9c01614fa18a2b238f63252711'
                        : 'd-b8bb196915bb49a6a16657774d01776d',
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
                        dynamic_template_data: { cardNumber: data.cardNumber },
                    },
                ],
            };

            const response = await sendGridClient.send(message);
            console.log(JSON.stringify(response));
        } else {
            console.log('Sending new card email with Mailjet.');
            const response = await mailjetClient.post('send', { version: 'v3.1' }).request({
                Messages: [
                    {
                        From: {
                            Email: 'noreply@cartafedelta.online',
                            Name: 'Risparmio Casa',
                        },
                        To: [
                            {
                                Email: details.email,
                            },
                        ],
                        InlinedAttachments: [
                            {
                                ContentType: 'image/png',
                                Filename: 'card.png',
                                Base64Content: img,
                                ContentId: 'id1',
                            },
                        ],
                        TemplateID:
                            details.registrationCountry === CountryCode.Malta ? 5803147 : 3868063,
                        TemplateLanguage: true,
                        Variables: {
                            cardNumber: data.cardNumber,
                            image: `<img width="320" style="display: block; margin: 0 auto;" src="cid:id1" />`,
                        },
                    },
                ],
            });
            console.log(JSON.stringify(response));
        }

        res.status(200).json({ cardNumber: data.cardNumber });
    }

    return res.status(404).end();
}
