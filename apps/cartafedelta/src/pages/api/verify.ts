import { RisparmioCasaRepository } from '../../core/repositories/RisparmioCasaRepository';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email, code, brand } = req.body;
        const risparmioCasaRepository = new RisparmioCasaRepository(brand);

        console.log(`Checking if email ${email} has been verified.`);
        const isVerified = await risparmioCasaRepository.verifyEmail(email, code);

        if (isVerified) {
            console.log('Verified email.');
            return res.status(204).end();
        }

        console.log('Email not verified');
        return res.status(400).end();
    }

    return res.status(404).end();
}
