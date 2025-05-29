import React from 'react';
import { IDialCode } from '../../core/models/IDialCode';
import PhoneNumberInput from './verification/PhoneNumberInput';
import { IVerifiedCardData } from '../../core/models/IVerifiedCardData';
import { CardVerificationStep } from '../../core/models/enums/CardVerificationStep';
import PhoneOtpVerification from './verification/PhoneOtpVerification';
import CardVerificationBarcode from './verification/CardNumberVerification';
import { CountryCode } from "../../core/models/enums/Country";
import {translate} from "../../utils/utils";
import {TranslationLanguageCode} from "../../core/models/enums/Translation";

interface ICardVerificationProps {
    brand: string;
    region?: CountryCode;
    languageCode?: TranslationLanguageCode;
    dialCodes: IDialCode[];
    checkIfCardAlreadyUpdated?: boolean;
    onSuccess: (verifiedCardData: IVerifiedCardData) => void;
}

const VerificationWizardItem = ({
    brand,
    region = CountryCode.Italy,
    languageCode = TranslationLanguageCode.It,
    dialCodes,
    checkIfCardAlreadyUpdated = true,
    onSuccess,
}: ICardVerificationProps) => {
    const [cardVerificationStep, setCardVerificationStep] = React.useState(
        CardVerificationStep.Barcode
    );

    const [verifiedCard, setVerifiedCard] = React.useState('');
    const [verifiedPhone, setVerifiedPhone] = React.useState('');

    return (
        <div className="w-full mx-auto mt-4 sm:mt-14">
            <div className="text-center">
                <p className="font-bold sm:text-xl">
                    {translate(languageCode, 'updateCard.verification.heading')}

                </p>
                {checkIfCardAlreadyUpdated && (
                    <p className="sm:text-xl">
                        {translate(languageCode, 'updateCard.verification.alreadyUpdated')}
                    </p>
                )}
            </div>

            {cardVerificationStep === CardVerificationStep.Barcode && (
                <CardVerificationBarcode
                    brand={brand}
                    region={region}
                    languageCode={languageCode}
                    checkIfCardAlreadyUpdated={checkIfCardAlreadyUpdated}
                    onSuccess={(verifiedCard) => {
                        setVerifiedCard(verifiedCard);
                        setCardVerificationStep(CardVerificationStep.Phone);
                    }}
                />
            )}

            {cardVerificationStep === CardVerificationStep.Phone && (
                <PhoneNumberInput
                    brand={brand}
                    countryCode={region}
                    languageCode={languageCode}
                    onSuccess={(verifiedPhone) => {
                        setVerifiedPhone(verifiedPhone);
                        setCardVerificationStep(CardVerificationStep.Otp);
                    }}
                    dialCodes={dialCodes}
                />
            )}

            {cardVerificationStep === CardVerificationStep.Otp && (
                <PhoneOtpVerification
                    brand={brand}
                    fullPhone={verifiedPhone}
                    languageCode={languageCode}
                    onSuccess={() =>
                        onSuccess({
                            verifiedPhoneNumber: verifiedPhone,
                            verifiedCardNumber: verifiedCard,
                        })
                    }
                />
            )}
        </div>
    );
};

export default VerificationWizardItem;
