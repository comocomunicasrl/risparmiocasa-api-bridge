import { Schema } from 'dynamoose';

export const FantasanremoCustomerSchema = new Schema({
    id: {
        type: String,
        hashKey: true
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    birthDate: {
        type: String
    },
    cardNumber: {
        type: String
    },
    email: {
        type: String
    },
    taxId: {
        type: String
    },
    submissionDate: {
        type: String
    },
    timestamp: {
        type: String
    }
});