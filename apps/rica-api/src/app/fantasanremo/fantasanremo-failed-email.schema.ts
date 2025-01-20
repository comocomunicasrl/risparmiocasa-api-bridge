import { Schema } from 'dynamoose';

export const FantasanremoFailedEmailSchema = new Schema({
    id: {
        type: String,
        hashKey: true
    },
    cardNumber: {
        type: String
    },
    email: {
        type: String
    },
    timestamp: {
        type: String
    }
});