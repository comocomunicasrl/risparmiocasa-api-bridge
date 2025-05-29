import axios from 'axios';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { cardNumber, registrationCountry, brand } = req.body;

        console.log(`Try to verify card ${cardNumber} for ${registrationCountry ?? 'it'} region`);

        try {
            const results = await axios.post(process.env.RISPARMIOCASA_VERIFY_CARD_SOAP_URL, {
                cardNumber,
                registrationCountry,
                brand
            });

            if (results.status !== 200) {
                console.log('Received bad status call from SOAP');
                return res.status(400).end();
            }

            return res.status(200).end();
        } catch (e) {
            console.log('Failed to check card', e);

            return res.status(400).end();
        }
    }

    return res.status(404).end();
}
