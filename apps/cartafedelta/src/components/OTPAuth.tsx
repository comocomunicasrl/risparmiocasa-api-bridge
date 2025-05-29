import { useState } from "react";
import EmailConfirmation from "./EmailConfirmation";
import { IPersonDetails } from "../core/models/IPersonDetails";
import { EmailProvider } from "../core/models/EmailProvider";
import PhoneNumberConfirmation from "./PhoneNumberConfirmation";
import { translate } from "../utils/utils";

interface PhoneNumberProps {
    brand: string;
    countryCode: string;
    onSuccess?: (IPersonDetails) => void;
};

const OTPAuth = ({ brand, countryCode, onSuccess }: PhoneNumberProps) => {
    const [otpMode, setOtpMode] = useState('email');
    const [details] = useState<IPersonDetails>({});
    const languageCode = (countryCode === 'mt') ? 'en' : 'it';

    const emailConfirmed = (email: string, provider: EmailProvider) => {
        onSuccess?.({
            email,
            phoneNumber: null,
            phoneNumberSecondary: null,
            registrationCountry: countryCode
        });
    };

    const phoneConfirmed = (phoneNumber: string) => {
        onSuccess?.({
            email: null,
            phoneNumber,
            phoneNumberSecondary: phoneNumber,
            registrationCountry: countryCode
        });
    };

    return (
        <div className="flex flex-col max-w-full relative justify-center items-center">
            <div className="text-xl font-bold text-center mb-8">{translate(languageCode, 'OTPAuth.chooseMode')}</div>
            <div className="flex flex-row flex-wrap gap-8 justify-center">
                <label className="form-check-label text-gray-600 text-[14px] sm:text-[17px] flex flex-row gap-2 items-center">
                    <input className={`form-check-input appearance-none text-gray-600 rounded-full h-6 w-6 border bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 align-top bg-no-repeat bg-center bg-contain float-left cursor-pointer border-gray-300 hover:border-black`}
                        type="radio" 
                        name="otpMode" 
                        value="email"
                        checked={otpMode === 'email'}
                        onChange={() =>
                            setOtpMode('email')
                        }
                    ></input>
                    {translate(languageCode, 'OTPAuth.emailAuth')}
                </label>
                <label className="form-check-label text-gray-600 text-[14px] sm:text-[17px] flex flex-row gap-2 items-center">
                    <input className={`form-check-input appearance-none text-gray-600 rounded-full h-6 w-6 border bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 align-top bg-no-repeat bg-center bg-contain float-left cursor-pointer border-gray-300 hover:border-black`}
                            type="radio" 
                            name="otpMode" 
                            value="sms"
                            checked={otpMode === 'sms'}
                            onChange={() =>
                                setOtpMode('sms')
                            }
                    ></input>
                    {translate(languageCode, 'OTPAuth.smsAuth')}
                </label>
            </div>
            <div className="grow w-full text-center">
                {(otpMode === 'email') && (
                    <EmailConfirmation
                        brand={brand}
                        details={details}
                        title=""
                        firstStepButtonLabel={translate(languageCode, 'common.next_step')?.toUpperCase()}
                        secondStepButtonLabel={translate(languageCode, 'common.next_step')?.toUpperCase()}
                        sentCodeMessage={translate(languageCode, 'OTPAuth.mailSent')}
                        onSuccess={emailConfirmed}
                        countryCode={countryCode}
                    />
                )}
                {(otpMode === 'sms') && (
                    <PhoneNumberConfirmation
                        brand={brand}
                        details={details}
                        title=""
                        sentCodeMessage={translate(languageCode, 'OTPAuth.smsSent')}
                        onSuccess={phoneConfirmed}
                        countryCode={countryCode}
                    />
                )}
            </div>
        </div>
    );
};

export default OTPAuth;