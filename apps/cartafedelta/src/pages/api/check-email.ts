import {RisparmioCasaRepository} from '../../core/repositories/RisparmioCasaRepository';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const risparmioCasaRepository = new RisparmioCasaRepository();
        const { email } = req.body;

        const hasCardRegistered = await risparmioCasaRepository.cardAlreadyExists(email);

        return res.status(200).json({ registered: hasCardRegistered })
    }

    return res.status(404).end();
}
