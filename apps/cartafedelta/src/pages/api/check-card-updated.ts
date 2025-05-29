import {RisparmioCasaRepository} from "../../core/repositories/RisparmioCasaRepository";

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { cardNumber, brand } = req.body;
        console.log('Try to verify card if already exist as updated', cardNumber);

        const risparmioCasaRepository = new RisparmioCasaRepository(brand);
        if (await risparmioCasaRepository.cardUpdateAlreadyExists(cardNumber)) {
            console.log('Card is already updated');
            return res.status(400).end();
        }

        return res.status(200).end();
    }

    return res.status(404).end();
}
