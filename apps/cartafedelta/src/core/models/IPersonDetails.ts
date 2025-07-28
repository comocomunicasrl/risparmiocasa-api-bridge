import { Gender } from './enums/Gender';
import { IBirthDate } from './IBirthDate';

export interface IPersonDetails {
    cardNumber?: string;
    name?: string;
    surname?: string;
    gender?: Gender;
    email?: string;
    city?: string;
    postalCode?: string;
    address?: string;
    streetNumber?: string;
    phoneNumber?: string;
    phoneNumberSecondary?: string;
    countryOfResidence?: string;
    registrationCountry?: string;
    preferredStore?: string;
    preferredStoreCode?: string;
    discountCode?: string;
    discountValue?: number;
    dateOfBirth?: IBirthDate;
    rules?: boolean;
    marketing?: boolean;
    statistics?: boolean;
    friendFidelityCard?: string;
}
