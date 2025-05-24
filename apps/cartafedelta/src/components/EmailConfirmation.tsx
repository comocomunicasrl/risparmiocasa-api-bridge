import { useEffect, useState } from 'react';
import InputContainer from './form/Input-container';
import { translate } from '../utils/utils';
import { IPersonDetails } from '../core/models/IPersonDetails';
import axios from 'axios';
import { EmailProvider } from '../core/models/EmailProvider';
import { CountryCode } from '../core/models/enums/Country';
import { FieldError, useForm } from 'react-hook-form';
import clsx from 'clsx';

interface IEmailConfirmationProps {
    details: IPersonDetails;
    title?: string; 
    firstStepButtonLabel?: string;
    secondStepButtonLabel?: string;
    sentCodeMessage?: string;
    countryCode: CountryCode|string;
    onSuccess: (email: string, provider: EmailProvider) => void;
}

const EmailConfirmation = ({ details, title, firstStepButtonLabel, secondStepButtonLabel, sentCodeMessage, countryCode, onSuccess }: IEmailConfirmationProps) => {
    const languageCode = (countryCode === 'mt') ? 'en' : 'it';
    const [error, setError] = useState(false);
    const [alreadyRegisteredError, setAlreadyRegisteredError] = useState(false);
    const [showVerificationScreen, setShowVerificationScreen] = useState(false);
    const [provider, setProvider] = useState(EmailProvider.SendGrid);
    const [timer, setTimer] = useState(0);
    const [loading, setLoading] = useState(false);
    let timerInt;
    let seconds = 1;

    const emailDataForm = useForm<{ email: string, repeatedEmail: string }>();
    const emailDataFormSubmit = emailDataForm.handleSubmit(() => handleClick());
    const emailFieldsRegisterOptions = { 
        required: true,
        pattern: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        validate: { equality: () => !emailDataForm.getValues('email') || !emailDataForm.getValues('repeatedEmail') || (emailDataForm.getValues('email') === emailDataForm.getValues('repeatedEmail')) }
    };
    const emailDataControlsFactories = { 
        email: () => {
            const registration = emailDataForm.register('email', emailFieldsRegisterOptions);
            return {
                ...registration,
                onChange: (e) => {
                    registration.onChange(e);
                    if (emailDataForm.formState.isSubmitted)
                        emailDataForm.trigger();
                }
            }
        },
        repeatedEmail: () => {
            const registration = emailDataForm.register('repeatedEmail', emailFieldsRegisterOptions);
            return {
                ...registration,
                onChange: (e) => {
                    registration.onChange(e);
                    if (emailDataForm.formState.isSubmitted)
                        emailDataForm.trigger();
                }
            }
        }
    };

    const OTPDataForm = useForm<{ code: string }>();
    const OTPlDataFormSubmit = OTPDataForm.handleSubmit(() => attemptVerification());

    const formErrorMap = new Map<string, string>([
        [ 'pattern', translate(languageCode, 'common.validity_pattern') ],
        [ 'required', translate(languageCode, 'common.validity_required') ],
        [ 'equality', translate(languageCode, 'common.validity_equality') ]
    ]);
    const getErrorText = (error: FieldError, errorMap: Map<string, string>) => {
        if (!error)
            return;

        if (error.message)
            return error.message;

        return errorMap.get(error.type) ?? undefined;
    }
    
    const startTimer = () => {
        timerInt = setInterval(function () {
            seconds++;
            setTimer(30 - seconds);
            if (seconds > 30) {
                clearInterval(timerInt);
            }
        }, 1000);
    };

    useEffect(() => {
        if (timer >= 30) {
            clearInterval(timerInt);
            seconds = 0;
            startTimer();
        }
    }, [timer]);

    const handleClick = async (
        provider: EmailProvider = EmailProvider.SendGrid,
        isRetry = false
    ) => {
        if (isRetry) {
            setTimer(30);
        }
        setLoading(true);
        setProvider(provider);

        axios.post('/api/check-email', { email: emailDataForm.getValues('email') })
            .then((result) => {
                if (result.data.registered) {
                    setAlreadyRegisteredError(true);
                    setLoading(false);
                    return;
                } else {
                    setError(false);
                    axios
                        .post('/api/register', {
                            ...details,
                            email: emailDataForm.getValues('email'),
                            provider,
                            registrationCountry: countryCode,
                        })
                        .then(() => {
                            setLoading(false);
                            setShowVerificationScreen(true);
                            setTimer(30);
                        })
                        .catch(() => {
                            setLoading(false);
                            window.alert('Sorry! Cannot perform request.');
                            window.location.reload();
                        });
                }
            })
            .catch(() => {
                setLoading(false);
                return false;
            });
    };

    const attemptVerification = () => {
        setLoading(true);
        axios.post('/api/verify', { email: emailDataForm.getValues('email'), code: OTPDataForm.getValues('code') })
            .then(() => {
                setError(false);
                onSuccess(emailDataForm.getValues('email'), provider);
            })
            .catch(() => {
                setLoading(false);
                setError(true);
            });
    };

    return (
        <div className="w-full mx-auto mt-4 sm:mt-14">
            {!showVerificationScreen && (
                <div className="w-full flex flex-col items-center justify-center">
                    <div className="text-center">
                        <p className="sm:text-xl">
                            {title ?? translate(languageCode, 'emailConfirmation.enterEmail')}
                        </p>
                    </div>
                    <div className="flex flex-col mt-4 sm:mt-8 sm:w-1/4">
                        <InputContainer
                            inputId="email"
                            label={translate(languageCode, 'emailConfirmation.email')}
                            required={true}
                            errorText={getErrorText(emailDataForm.formState.errors?.email, formErrorMap)}
                        >
                            <input autoComplete="off"
                                id="email"
                                type="email"
                                className={`rounded h-[40px] w-full mt-2 px-4 text-gray-600 ${
                                    emailDataForm.getFieldState('email').invalid
                                        ? 'border-red-700 outline-red-800 border-2'
                                        : 'border-risparmiocasa-neutral outline-blue-600 hover:border-black border'
                                }`}
                                { ...emailDataControlsFactories.email() }
                            />
                        </InputContainer>
                    </div>
                    <div className="flex flex-col mt-4 sm:mt-8 sm:w-1/4">
                        <InputContainer
                            inputId="repeatedEmail"
                            label={translate(languageCode, 'emailConfirmation.emailRepeat')}
                            required={true}
                            errorText={getErrorText(emailDataForm.formState.errors?.repeatedEmail, formErrorMap)}
                        >
                            <input autoComplete="off"
                                id="repeatedEmail"
                                type="email"
                                className={`rounded h-[40px] w-full mt-2 px-4 text-gray-600 ${
                                    emailDataForm.getFieldState('repeatedEmail').invalid
                                        ? 'border-red-700 outline-red-800 border-2'
                                        : 'border-risparmiocasa-neutral outline-blue-600 hover:border-black border'
                                }`}
                                { ...emailDataControlsFactories.repeatedEmail() }
                            />
                        </InputContainer>
                    </div>
                    {alreadyRegisteredError && (
                        <div className="mx-auto mt-4 text-center sm:mt-10">
                            <span className="text-red-600 text-[12px] sm:text-xl">
                                {translate(
                                    languageCode,
                                    'emailConfirmation.alreadyRegisteredError'
                                )}
                            </span>
                        </div>
                    )}
                    <div className="mt-4 mb-4 text-center sm:mt-0 sm:mb-4">
                        <button
                            className={`mx-auto mt-5 sm:mt-10 bg-risparmiocasa-blue rounded-3xl p-2 px-10 ${
                                loading ? 'opacity-80 cursor-not-allowed' : ''
                            }`}
                            onClick={(e) => {
                                if (!loading) emailDataFormSubmit(e);
                            }}
                        >
                            <span className="text-[12px] sm:text-[18px] font-bold text-white">
                                {firstStepButtonLabel ?? translate(languageCode, 'emailConfirmation.proceed')}
                            </span>
                        </button>
                    </div>
                    {loading && (
                        <div className="inline-block w-full mx-auto mt-0 text-center">
                            <div className="flex items-center justify-center mt-2 sm:mt-0">
                                <svg
                                    role="status"
                                    className="inline w-4 h-4 m-1 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="currentFill"
                                    />
                                </svg>
                                <p className="sm:mt-0 text-[14px] leading-6 text-center">
                                    {translate(languageCode, 'emailConfirmation.loading')}...
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {showVerificationScreen && (
                <div className="w-full flex flex-col items-center justify-center">
                    {sentCodeMessage && (
                        <p className="text-[14px] sm:text-xl"  dangerouslySetInnerHTML={
                            { __html: sentCodeMessage }
                        }></p>
                    )}
                    {!sentCodeMessage && (<p className="text-[14px] sm:text-xl">
                        {translate(languageCode, 'emailConfirmation.confirmEmailOne')}
                        <br /> {translate(languageCode, 'emailConfirmation.confirmEmailTwo')}
                        <br /> {translate(languageCode, 'emailConfirmation.confirmEmailThree')}
                    </p>)}
                    <div className="flex flex-col mt-4 sm:mt-8 sm:w-1/4">
                        <InputContainer
                            inputId="code"
                            label={translate(languageCode, 'emailConfirmation.insertCode')}
                            required={true}
                            errorText={getErrorText(OTPDataForm.formState.errors?.code, formErrorMap)}
                        >
                            <input autoComplete="off"
                                id="code"
                                type="text"
                                className={`rounded h-[40px] w-full mt-2 px-4 text-gray-600 ${
                                    OTPDataForm.getFieldState('code').invalid
                                        ? 'border-red-700 outline-red-800 border-2'
                                        : 'border-risparmiocasa-neutral outline-blue-600 hover:border-black border'
                                }`}
                                { ...OTPDataForm.register('code', { required: true }) }
                            />
                        </InputContainer>
                        <div className="mt-4 mb-4 text-center sm:mt-0 flex flex-row gap-8 gap-y-0 flex-wrap-reverse">
                            <button
                                className={clsx(
                                    'mx-auto mt-2 sm:mt-10 bg-red-800 rounded-3xl p-2 px-10',
                                    loading && 'opacity-80 cursor-not-allowed'
                                )}
                                onClick={() => setShowVerificationScreen(false)}
                            >
                                <span className="text-[12px] sm:text-[18px] font-bold text-white">{translate(languageCode, 'common.cancel')?.toUpperCase()}</span>
                            </button>
                            <button
                                className="p-2 px-10 mx-auto mt-2 sm:mt-10 bg-risparmiocasa-blue rounded-3xl"
                                onClick={(e) => {
                                    if (!loading) OTPlDataFormSubmit(e);
                                }}
                            >
                                <span
                                    className={`text-[12px] sm:text-[18px] font-bold text-white ${
                                        loading ? 'opacity-80 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {secondStepButtonLabel ?? translate(languageCode, 'emailConfirmation.proceed')}
                                </span>
                            </button>
                        </div>
                        {loading && (
                            <div className="inline-block w-full mx-auto mt-0 text-center">
                                <div className="flex items-center justify-center mt-2 sm:mt-0">
                                    <svg
                                        role="status"
                                        className="inline w-4 h-4 m-1 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                        viewBox="0 0 100 101"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                            fill="currentColor"
                                        />
                                        <path
                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                            fill="currentFill"
                                        />
                                    </svg>
                                    <p className="sm:mt-0 text-[14px] leading-6 text-center">
                                        {translate(languageCode, 'emailConfirmation.loading')}...
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    {error && (
                        <div className="mt-4 sm:mt-4">
                            <span className="text-red-600 text-[12px] sm:text-xl">
                                {translate(languageCode, 'emailConfirmation.invalidCodeError')}
                            </span>
                        </div>
                    )}
                    <div className="mt-4 sm:mt-8 text-[12px] sm:text-xl">
                        {translate(languageCode, 'emailConfirmation.codeNotReceived')}
                    </div>
                    <div className="mt-2 mb-4 sm:mt-4 sm:mb-10">
                        {timer <= 0 && !loading && (
                            <a
                                onClick={() => handleClick(EmailProvider.MailJet, true)}
                                className="text-blue-600 underline cursor-pointer text-[12px] sm:text-xl"
                            >
                                {translate(languageCode, 'emailConfirmation.resend')}
                            </a>
                        )}
                        {timer > 0 && (
                            <span className="text-gray-300 no-underline cursor-not-allowed">
                                {timer} s... {translate(languageCode, 'emailConfirmation.resend')}
                            </span>
                        )}
                    </div>
                </div>
            )}
            <div className="w-full mt-5 sm:mt-10 text-left">
                <p className="text-xs text-orange-700 sm:text-sm">
                    *{translate(languageCode, 'personalDetails.requiredFields')}
                </p>
            </div>
        </div>
    );
};
export default EmailConfirmation;
