import { useState } from 'react';
import dialCodes from '../core/data/dialCodes.json';
import { IPersonDetails } from '../core/models/IPersonDetails';
import PhoneNumberInput from './data-update-wizard/verification/PhoneNumberInput';
import PhoneOtpVerification from './data-update-wizard/verification/PhoneOtpVerification';
import { TranslationLanguageCode } from '../core/models/enums/Translation';
import { translate } from '../utils/utils';

interface IPhoneNumberConfirmationProps {
    details: IPersonDetails;
    title?: string; 
    sentCodeMessage?: string;
    countryCode: string;
    onSuccess: (phoneNumber: string) => void;
}

const PhoneNumberConfirmation = ({ details, title, sentCodeMessage, countryCode, onSuccess }: IPhoneNumberConfirmationProps) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneVerificationStep, setPhoneVerificationStep] = useState('phone');
    const languageCode = (countryCode === 'mt') ? 'en' : 'it';

    return (
        <div className="w-full mx-auto mt-4 sm:mt-14">
            {phoneVerificationStep === 'phone' && (
                <PhoneNumberInput
                    phoneNumberInputTitle={translate(languageCode, 'phoneNumberInput.insertPhone') + ':'}
                    confirmButtonLabel={translate(languageCode, 'common.next_step')?.toUpperCase()}
                    countryCode={countryCode}
                    languageCode={(countryCode === 'mt') ? TranslationLanguageCode.En : TranslationLanguageCode.It}
                    onSuccess={(phoneNumber) => {
                        setPhoneNumber(phoneNumber);
                        setPhoneVerificationStep('otp');
                    }}
                    dialCodes={dialCodes}
                />
            )}

            {phoneVerificationStep === 'otp' && (
                <div className="text-center">
                    {sentCodeMessage && (
                        <p className="text-[14px] sm:text-xl"  dangerouslySetInnerHTML={
                            { __html: sentCodeMessage }
                        }></p>
                    )}
                    <PhoneOtpVerification
                        fullPhone={phoneNumber}
                        otpHeadingText=''
                        otpLabel={translate(languageCode, 'common.enterToContinue')}
                        languageCode={(countryCode === 'mt') ? TranslationLanguageCode.En : TranslationLanguageCode.It}
                        onSuccess={() => onSuccess(phoneNumber)}
                        onCancel={() => setPhoneVerificationStep('phone')}
                    />
                </div>
            )}
        </div>
    );
};
export default PhoneNumberConfirmation;