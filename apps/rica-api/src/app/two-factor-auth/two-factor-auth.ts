export interface TwoFactorAuthKey {
    id: string;
}

export interface TwoFactorAuth extends TwoFactorAuthKey {
    recipient: string;
    OTP: string;
    creationDate: string;
}