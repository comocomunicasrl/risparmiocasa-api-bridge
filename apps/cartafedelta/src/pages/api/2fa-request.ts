// import sms from '../../lib/sms';
import { TranslationLanguageCode } from "../../core/models/enums/Translation";
import axios from 'axios';

export default async function handler(req, res) {
    const { phoneNumber, languageCode } = req.body;

    if (req.method === 'POST') {
        // if ((phoneNumber as string).startsWith('+93')) {
            try {
                const results = await axios.post(`${process.env.RISPARMIOCASA_API_GATEWAY_URL}/two-factor-auth/sendOTP`, {
                    recipient: phoneNumber, // .replace('+93', '+39'),
                    languageCode: languageCode ? languageCode : TranslationLanguageCode.It
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
        // } else {
        //     console.log('Request 2fa for phone number', phoneNumber);
        //     const isSent = await sms.request2FA({
        //         recipient: phoneNumber,
        //         languageCode: languageCode ? languageCode : TranslationLanguageCode.It
        //     });

        //     if (!isSent) {
        //         console.error('Failed to send 2fa');
        //         return res.status(400).end();
        //     }

        //     return res.status(200).end();
        // }
    }

    return res.status(404).end();
}
