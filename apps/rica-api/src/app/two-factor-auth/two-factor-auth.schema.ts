import { Schema } from 'dynamoose';

export const TwoFactorAuthSchema = new Schema({
    id: {
        type: String,
        hashKey: true
    },
    recipient: {
        type: String
    },
    OTP: {
        type: String
    },
    creationDate: {
        type: String
    }
});