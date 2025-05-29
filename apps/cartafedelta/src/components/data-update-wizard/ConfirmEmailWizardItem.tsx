import React, { useState } from 'react';
import Input from '../form/Input';
import {isValidEmail, translate} from '../../utils/utils';
import { IPersonDetails } from '../../core/models/IPersonDetails';
import axios from 'axios';
import { EmailProvider } from '../../core/models/EmailProvider';
import {TranslationLanguageCode} from "../../core/models/enums/Translation";

interface IEmailConfirmationProps {
    brand: string;
    details: IPersonDetails;
    languageCode?: TranslationLanguageCode,
    onSuccess: (email: string, provider: EmailProvider) => void;
}

const ConfirmEmailWizardItem = ({
    brand,
    details,
    languageCode = TranslationLanguageCode.It,
    onSuccess
}: IEmailConfirmationProps) => {
    const [email, setEmail] = useState('');
    const [repeatedEmail, setRepeatedEmail] = useState('');
    const [error, setError] = useState(false);
    const [alreadyRegisteredError, setAlreadyRegisteredError] = useState(false);
    const [code, setCode] = useState('');
    const [showVerificationScreen, setShowVerificationScreen] = React.useState(false);
    const [provider, setProvider] = React.useState(EmailProvider.SendGrid);
    const [timer, setTimer] = React.useState(0);
    const [loading, setLoading] = React.useState(false);
    let timerInt;
    let seconds = 1;

    const startTimer = () => {
        timerInt = setInterval(function () {
            seconds++;
            setTimer(30 - seconds);
            if (seconds > 30) {
                clearInterval(timerInt);
            }
        }, 1000);
    };

    React.useEffect(() => {
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
        if (email !== repeatedEmail || !isValidEmail(email) || !isValidEmail(repeatedEmail)) {
            setError(true);
            setLoading(false);
            return;
        }
        axios
            .post('/api/check-email-update-card', { email, cardNumber: details.cardNumber, brand })
            .then((result) => {
                if (result.data.emailTaken) {
                    setAlreadyRegisteredError(true);
                    setLoading(false);

                    return;
                } else {
                    setError(false);
                    axios
                        .post('/api/email-verify-request', {
                            email,
                            provider,
                            brand
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
        axios
            .post('/api/verify', { email, code, brand })
            .then(() => {
                setError(false);
                onSuccess(email, provider);
            })
            .catch(() => {
                setLoading(false);
                setError(true);
            });
    };

    return (
        <div className="w-full mx-auto mt-4 sm:mt-14">
            {!showVerificationScreen && (
                <div>
                    <div className="text-center">
                        <p className="sm:text-xl">
                            {translate(languageCode, 'emailConfirmation.enterEmail')}
                        </p>
                    </div>
                    <div className="mx-auto mt-4 sm:mt-8 sm:w-1/3">
                        <Input
                            id="email"
                            label={translate(languageCode, 'emailConfirmation.email')}
                            required
                            error={error}
                            onChange={(email) => setEmail(email)}
                        />
                    </div>
                    <div className="mx-auto mt-4 sm:mt-8 sm:w-1/3">
                        <Input
                            id="email-repeated"
                            label={translate(languageCode, 'emailConfirmation.emailRepeat')}
                            required
                            error={error}
                            onChange={(email) => setRepeatedEmail(email)}
                        />
                    </div>
                    {alreadyRegisteredError && (
                        <div className="mx-auto mt-4 text-center sm:mt-10">
                            <span className="text-red-600 text-[12px] sm:text-xl">
                                {translate(languageCode, 'emailConfirmation.alreadyRegisteredError')}
                            </span>
                        </div>
                    )}
                    <div className="mt-4 mb-4 text-center sm:mt-0 sm:mb-4">
                        <button
                            className={`mx-auto mt-5 sm:mt-10 bg-brand-primary rounded-3xl p-2 px-10 ${
                                loading ? 'opacity-80 cursor-not-allowed' : ''
                            }`}
                            onClick={() => {
                                if (!loading) handleClick();
                            }}
                        >
                            <span className="text-[12px] sm:text-[18px] font-bold text-white">
                                {translate(languageCode, 'common.proceed')}
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
                                    {translate(languageCode, 'common.loadingInProgress')}...
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
            {showVerificationScreen && (
                <div className="text-center">
                    <p className="text-[14px] sm:text-xl">
                        {translate(languageCode, 'emailConfirmation.confirmEmailOne')}
                        <br/> {translate(languageCode, 'emailConfirmation.confirmEmailTwo')}
                        <br/> {translate(languageCode, 'emailConfirmation.confirmEmailThree')}
                    </p>
                    <div className="mx-auto mt-4 sm:mt-8 sm:w-1/3">
                        <Input
                            id="code"
                            label={translate(languageCode, 'emailConfirmation.insertCode')}
                            required
                            error={error}
                            onChange={(code) => setCode(code)}
                        />
                        <div className="mt-4 mb-4 text-center sm:mt-0">
                            <button
                                className="p-2 px-10 mx-auto mt-2 sm:mt-10 bg-brand-primary rounded-3xl"
                                onClick={() => {
                                    if (!loading) attemptVerification();
                                }}
                            >
                                <span
                                    className={`text-[12px] sm:text-[18px] font-bold text-white ${
                                        loading ? 'opacity-80 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {translate(languageCode, 'common.proceed')}
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
                                        {translate(languageCode, 'common.loadingInProgress')}... ...
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
                                {translate(languageCode, 'emailConfirmation.resend')}.
                            </a>
                        )}
                        {timer > 0 && (
                            <span className="text-gray-300 no-underline cursor-not-allowed">
                                {timer} s... {translate(languageCode, 'emailConfirmation.resend')}.
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
export default ConfirmEmailWizardItem;
