import axios from 'axios';
import sendGrid from '../../lib/sendGrid';
import { RisparmioCasaRepository } from '../../core/repositories/RisparmioCasaRepository';
import JsBarcode from 'jsbarcode';
import { EmailProvider } from '../../core/models/EmailProvider';
import { mailjetClient } from '../../lib/mailjet';
import { createCanvas } from 'canvas';

const emailTemplateMap = {
    rica: { 
        senderName: 'Risparmio Casa',
        senderEmail: 'noreply@cartafedelta.online',
        replyTo: 'cartafedelta@risparmiocasa.com',
        sendgridTemplateIds: {
            it: 'd-b8bb196915bb49a6a16657774d01776d',
            mt: 'd-5e29ba9c01614fa18a2b238f63252711',
            ch: 'd-b8bb196915bb49a6a16657774d01776d'
        },
        mailjetTemplateIds: {
            it: 3868063,
            mt: 5803147,
            ch: 3868063
        }
    },
    uniprice: { 
        senderName: 'Uniprice',
        senderEmail: 'noreply@cartafedelta.online',
        replyTo: 'cartafedelta@uniprice.eu',
        sendgridTemplateIds: {
            it: 'd-e4d1790d0f8c42989efe991f7f2c5e42',
            mt: '',
            ch: ''
        },
        mailjetTemplateIds: {
            it: 7031724,
            mt: -1,
            ch: -1
        }
    }
}

export default async function handler(req, res) {
    if (req.method === 'PUT') {
        const { details, brand } = req.body;
        console.log(details);
        await axios.post(process.env.RISPARMIOCASA_CREATE_CARD_SOAP_URL.replace('create-card', 'create-card-temp'), {
            details, brand
        });
        return res.status(200).end();
    } else if (req.method === 'POST') {
        const { provider, brand, details } = req.body;
        const risparmioCasaRepository = new RisparmioCasaRepository(brand);

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
            details, brand
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
        if (details.friendFidelityCard) {
            await risparmioCasaRepository.registerFriendFidelityCard(details.cardNumber, details.friendFidelityCard);
        }

        if (details.discountCode) {
            const discount = await risparmioCasaRepository.getDiscountCode(details.discountCode);
            if (discount) {
                console.log('Found valid discount code. Applying to the card.');
                const discountAssignmentRes = await axios
                    .post(process.env.RISPARMIOCASA_DISCOUNT_SOAP_URL, {
                        store: details.preferredStoreCode,
                        cardNumber: data.cardNumber,
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

        const canvas = createCanvas(210, 120);
        JsBarcode(canvas, data.cardNumber, { format: 'EAN13', displayValue: false, flat: true });
        const img = canvas.toDataURL().split(';base64,')[1];

        if (provider === EmailProvider.SendGrid) {
            console.log('Sending new card email with Sendgrid.');
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
                            Email: emailTemplateMap[brand].senderEmail,
                            Name: emailTemplateMap[brand].senderName,
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
                        TemplateID: emailTemplateMap[brand].mailjetTemplateIds[details.registrationCountry],
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
