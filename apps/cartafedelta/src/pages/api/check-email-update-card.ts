import { RisparmioCasaRepository } from '../../core/repositories/RisparmioCasaRepository';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const risparmioCasaRepository = new RisparmioCasaRepository();
        const { email, cardNumber } = req.body;

        const emailAlreadyRegistered = await risparmioCasaRepository.cardAlreadyExists(email);

        if (emailAlreadyRegistered) {
            const registeredCardNumber = await risparmioCasaRepository.getCardNumberByEmail(email);

            if (registeredCardNumber === cardNumber) {
                return res.status(200).json({ emailTaken: false });
            }
        }

        return res.status(200).json({ emailTaken: emailAlreadyRegistered });
    }

    return res.status(404).end();
}
