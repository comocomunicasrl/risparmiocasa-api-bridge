import JsBarcode from "jsbarcode";
import {email as emailHTML} from "../../core/data/email";
import sendGrid from "../../lib/sendGrid";

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const {createCanvas} = require('canvas')
        const canvas = createCanvas();
        JsBarcode(canvas, '0220000004109', {format: "EAN13", displayValue: false});
        const img = canvas.toDataURL().split(';base64,')[1];
        console.log(img);
        const { sendGridClient } = sendGrid;

        const msg = {
            to: "petersons.toms@gmail.com",
            from: { name: 'Risparmio Casa', email: 'noreply@cartafedelta.online' },
            replyTo: { email: 'cartafedelta@risparmiocasa.com' },
            subject: 'Nuova Carta Fedeltà Risparmio Casa',
            attachments: [
                {
                    content: img,
                    filename: 'card.jpg',
                    content_id: 'card',
                    disposition: 'inline',
                    type: 'image/jpg',
                },
            ],
            text: `Nuova Carta Fedeltà Risparmio Casa
                Gentile Cliente, ecco a te la tua nuova carta fedeltà Risparmio Casa!
                0220000004109
                Puoi salvarla sul tuo smartphone o APP preferita!
                Segui Risparmio Casa.`,
            html: emailHTML.replace(
                '#IMAGE#',
                `<img width="320" style="display: block; margin: 0 auto;" src="cid:card" alt="0220000004109" />`
            ).replace('#CARDNUMBER#', "0220000004109"),
        };
        await sendGridClient.send(msg);
        res.status(200).end();
    }

    return res.status(404).end();
}
