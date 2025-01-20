export interface FantasanremoFailedEmailKey {
    id: string;
}

export interface FantasanremoFailedEmail extends FantasanremoFailedEmailKey {
    cardNumber: string;
    email: string;
    timestamp: string;
}