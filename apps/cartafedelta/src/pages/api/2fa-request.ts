import { TranslationLanguageCode } from "../../core/models/enums/Translation";
import axios from 'axios';

export default async function handler(req, res) {
    const { phoneNumber, languageCode, brand, token } = req.body;

    if (req.method === 'POST') {
        try {
            const recaptchaVerifyRes = await axios.post('https://www.google.com/recaptcha/api/siteverify', {
                secret: process.env.RECAPTCHA_SHARED_KEY,
                response: token
            }, {
                headers: { "Content-Type": "application/x-www-form-urlencoded" }
            });

            if ((recaptchaVerifyRes.status < 200) || (recaptchaVerifyRes.status > 299) || (!recaptchaVerifyRes.data.success) || (recaptchaVerifyRes.data.action != 'submit') || (recaptchaVerifyRes.data.score <= 0.5)) {
                console.log('Received captcha error');
                console.log(recaptchaVerifyRes.data);
                return res.status(400).end();
            }

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
