export interface FantasanremoCustomerKey {
    id: string;
}

export interface FantasanremoCustomer extends FantasanremoCustomerKey {
    firstname: string;
    lastname: string;
    birthDate: string;
    cardNumber: string;
    taxId: string;
    email: string;
    submissionDate: string;
    timestamp: string;
}