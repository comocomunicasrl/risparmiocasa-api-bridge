import { RisparmioCasaRepository } from '../../core/repositories/RisparmioCasaRepository';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email, cardNumber, brand } = req.body;
        const risparmioCasaRepository = new RisparmioCasaRepository(brand);

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
