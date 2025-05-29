import {RisparmioCasaRepository} from '../../core/repositories/RisparmioCasaRepository';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { email, brand } = req.body;
        const risparmioCasaRepository = new RisparmioCasaRepository(brand);

        const hasCardRegistered = await risparmioCasaRepository.cardAlreadyExists(email);

        return res.status(200).json({ registered: hasCardRegistered })
    }

    return res.status(404).end();
}
