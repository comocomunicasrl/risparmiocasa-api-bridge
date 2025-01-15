interface ApiUserInfo {
    cardNumber: string;
    firstname: string;
    lastname: string;
    birthdate: Date;
    taxId: string;
    email: string;
    rulesAcceptance: boolean;
    privacyPolicyAcceptance: boolean;
}

export type { ApiUserInfo };