import { TranslationLanguageCode } from "../../core/models/enums/Translation";
import axios from 'axios';

export default async function handler(req, res) {
    const { phoneNumber, languageCode, brand } = req.body;

    if (req.method === 'POST') {
        try {
            const results = await axios.post(`${process.env.RISPARMIOCASA_API_GATEWAY_URL}/two-factor-auth/sendOTP`, {
                recipient: phoneNumber,
                languageCode: languageCode ? languageCode : TranslationLanguageCode.It,
                brand
            });

            if ((results.status < 200) || (results.status > 299)) {
                console.log('Received error sending OTP');
                return res.status(400).end();
            }

            return res.status(200).end();
        } catch (e) {
            console.log('Failed to send OTP', e);

            return res.status(400).end();
        }
    }

    return res.status(404).end();
}
