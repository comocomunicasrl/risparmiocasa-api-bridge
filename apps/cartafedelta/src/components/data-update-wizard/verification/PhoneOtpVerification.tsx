import React from 'react';
import clsx from 'clsx';
import useCountDown from './hooks/useCountDown';
import axios from 'axios';
import {translate} from "../../../utils/utils";
import {TranslationLanguageCode} from "../../../core/models/enums/Translation";
import Input from '../../form/Input';

const PhoneOtpVerification = ({
    fullPhone,
    otpHeadingText,
    otpLabel,
    languageCode = TranslationLanguageCode.It,
    onSuccess,
    onCancel
}: {
    fullPhone: string;
    otpHeadingText?: string;
    otpLabel?: string;
    languageCode?: TranslationLanguageCode;
    onSuccess: () => void;
    onCancel?: () => void;
}) => {
    const [loading, setLoading] = React.useState(false);
    const [otp, setOtp] = React.useState('');
    const [counter, resetCounter] = useCountDown();
    const [error, setError] = React.useState(false);

    const isInputValid = (): boolean => {
        setError(false);

        if (otp?.trim().length === 0) {
            return false;
        }
        return true;
    };

    function verify2FA(): Promise<boolean> {
        if (!isInputValid()) {
            return;
        }

        setLoading(true);
        const result = axios
            .post('/api/2fa-verify', { phoneNumber: fullPhone, pin: otp })
            .then(() => true)
            .catch(() => {
                setError(true);
                return false;
            });

        setLoading(false);
        return result;
    }

    function request2FA(): Promise<boolean> {
        setLoading(true);
        const result = axios
            .post('/api/2fa-request', {
                phoneNumber: fullPhone,
                languageCode
            })
            .then(() => true)
            .catch(() => {
                setError(true);
                return false;
            });

        setLoading(false);
        return result;
    }

    return (
        <>
            <div className="mt-8 text-center">
                <p className="text-[14px] sm:text-[17px] text-gray-600">{otpHeadingText ?? translate(languageCode, 'updateCard.verification.otp.heading')}</p>
            </div>
            <div className="mx-auto mt-4 sm:mt-8 sm:w-1/3">
                <Input
                    id="code"
                    label={otpLabel ?? translate(languageCode, 'updateCard.verification.otp.label')}
                    required
                    error={error}
                    onChange={(code) => setOtp(code)}
                />
                {/* <input
                    className={clsx(
                        'rounded h-[40px] w-full mt-2 px-4 text-gray-600 outline-blue-600',
                        'ml-2',
                        valueError
                            ? 'border-red-700 border-2'
                            : 'border-risparmiocasa-neutral hover:border-black border'
                    )}
                    onChange={(event) => setOtp(event.target.value)}
                /> */}
            </div>

            <div className="mt-12 text-center">
                <a
                    className={clsx(
                        'sm:text-sm',
                        !counter &&
                            'font-medium text-blue-600 dark:text-blue-500 hover:underline cursor-pointer',
                        !!counter && 'pointer-events-none cursor-not-allowed'
                    )}
                    onClick={async () => {
                        if (!counter && !loading) {
                            setError(false);
                            await request2FA();
                            resetCounter();
                        }
                    }}
                >
                    {translate(languageCode, 'updateCard.verification.otp.sendAgain')}{' '}
                    {!!counter ? `(${counter})` : ''}
                </a>
            </div>

            <div className="flex flex-row justify-center gap-8 gap-y-0 flex-wrap-reverse">
                {onCancel && (
                    <button
                        className={clsx(
                            'mt-5 md:mt-10 bg-red-800 rounded-3xl p-2 px-10',
                            loading && 'opacity-80 cursor-not-allowed'
                        )}
                        onClick={() => onCancel()}
                    >
                        <span className="text-[12px] sm:text-[18px] font-bold text-white">{translate(languageCode, 'common.cancel')?.toUpperCase()}</span>
                    </button>
                )}
                <button
                    className={clsx(
                        'mt-5 md:mt-10 bg-risparmiocasa-blue rounded-3xl p-2 px-10',
                        loading && 'opacity-80 cursor-not-allowed'
                    )}
                    onClick={async () => {
                        if (loading) return;

                        if (await verify2FA()) {
                            onSuccess();
                        }
                    }}
                >
                    <span className="text-[12px] sm:text-[18px] font-bold text-white">{translate(languageCode, 'common.proceed')}</span>
                </button>
            </div>

            {error && (
                <div className="text-center text-red-700 mt-14">
                    {translate(languageCode, 'updateCard.verification.otp.error')}
                </div>
            )}
        </>
    );
};

export default PhoneOtpVerification;
