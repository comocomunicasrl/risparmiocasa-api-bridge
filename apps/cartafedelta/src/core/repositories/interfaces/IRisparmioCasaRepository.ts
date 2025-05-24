import { IPersonDetails } from '../../models/IPersonDetails';
import { IPreferredStore } from '../../models/IPreferredStore';
import { IDiscountCode } from '../../models/IDiscountCode';

export interface IRisparmioCasaRepository {
    createCard(details: IPersonDetails, verificationCode: string): Promise<void>;
    updateCard(details: IPersonDetails): Promise<void>;
    registerCard(email: string, cardNumber: string): Promise<void>;
    cardAlreadyExists(email: string): Promise<boolean>;
    isVerifiedEmail(email: string): Promise<boolean>;
    verifyEmail(email: string, verificationCode: string): Promise<boolean>;
    getPreferredStores(): Promise<IPreferredStore[]>;
    getDiscountCode(code: string): Promise<IDiscountCode | null>;
    updateDiscountCodeAssignmentDate(email: string, date: Date): Promise<boolean>;
    addCardUpdated(details: IPersonDetails): Promise<void>;
    cardUpdateAlreadyExists(cardNumber: string): Promise<boolean>;
    getCardNumberByEmail(email: string): Promise<string | null>;
    setVerificationCode(email: string, verificationCode: string): Promise<void>;
}
