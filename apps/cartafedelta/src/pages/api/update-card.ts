import { RisparmioCasaRepository } from '../../core/repositories/RisparmioCasaRepository';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { details, brand } = req.body;
        const risparmioCasaRepository = new RisparmioCasaRepository(brand);

        console.log('Trying to add update record', details);
        await risparmioCasaRepository.addCardUpdated(details);

        res.status(200).end();
    }

    return res.status(404).end();
}
