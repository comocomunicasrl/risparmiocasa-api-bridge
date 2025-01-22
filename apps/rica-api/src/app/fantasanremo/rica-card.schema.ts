import { Schema } from 'dynamoose';

export const RicaCardCustomerSchema = new Schema({
    PK: {
        type: String,
        hashKey: true
    },
    cardNumber: {
        type: String
    },
    discountCode: {
        type: String
    }
});