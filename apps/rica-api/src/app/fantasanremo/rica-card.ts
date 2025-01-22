export interface RicaCardKey {
    PK: string;
}

export interface RicaCard extends RicaCardKey {
    cardNumber: string;
    discountCode: string;
}