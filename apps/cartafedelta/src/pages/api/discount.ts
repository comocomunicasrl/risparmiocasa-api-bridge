import { RisparmioCasaRepository } from '../../core/repositories/RisparmioCasaRepository';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { code, brand } = req.query;
        const risparmioCasaRepository = new RisparmioCasaRepository(brand);

        const discount = await risparmioCasaRepository.getDiscountCode(code);
        return discount ? res.status(200).end() : res.status(400).end();
    }

    return res.status(400).end();
}
