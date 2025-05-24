// import sms from '../../lib/sms';
import axios from 'axios';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { phoneNumber, pin } = req.body;
        // if ((phoneNumber as string).startsWith('+93')) {
            try {
                const resp = await axios.post(`${process.env.RISPARMIOCASA_API_GATEWAY_URL}/two-factor-auth/verifyOTP`, {
                    recipient: phoneNumber, // .replace('+93', '+39'),
                    OTP: pin
                });

                if ((resp.status < 200) || (resp.status > 299) || (resp.data === false)) {
                    console.log('Received error verifying OTP');
                    return res.status(400).end();
                }

                return res.status(200).end();
            } catch (e) {
                console.log('Failed to verify 2fa', e);

                return res.status(400).end();
            }
        // } else {

        //     const isSent = await sms.verify2FA({ recipient: phoneNumber, pin });

        //     if (!isSent) {
        //         console.error('Failed to verify 2fa');
        //         return res.status(400).end();
        //     }

        //     return res.status(200).end();
        // }
    }

    return res.status(404).end();
}
