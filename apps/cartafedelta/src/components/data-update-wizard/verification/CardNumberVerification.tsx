import React from 'react';
import clsx from 'clsx';
import axios from 'axios';
import {translate} from "../../../utils/utils";
import {TranslationLanguageCode} from "../../../core/models/enums/Translation";
import {CountryCode} from "../../../core/models/enums/Country";

interface ICardVerificationBarcodeProps {
    brand: string;
    region?: CountryCode;
    checkIfCardAlreadyUpdated?: boolean;
    languageCode?: TranslationLanguageCode;
    onSuccess: (verifiedCard: string) => void;
}

const CardVerificationBarcode = ({
    brand,
    checkIfCardAlreadyUpdated = true,
    region = CountryCode.Italy,
    languageCode = TranslationLanguageCode.It,
    onSuccess,
}: ICardVerificationBarcodeProps) => {
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [valueError, setValueError] = React.useState(false);
    const [card, setCard] = React.useState('');

    const isInputValid = (): boolean => {
        setError(false);
        setValueError(false);

        if (card?.trim().length === 0) {
            setValueError(true);
            return false;
        }
        return true;
    };

    const handleVerify = async () => {
        if (!isInputValid()) {
            return;
        }

        setLoading(true);
        try {
            if (checkIfCardAlreadyUpdated) {
                await axios.post('/api/check-card-updated', { cardNumber: card, brand });
            }

            await axios.post('/api/check-card', { cardNumber: card, registrationCountry: region, brand });

            setError(false);
            onSuccess(card);
        } catch (e) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <img src="/card-with-barcode.jpg" alt="Fidelity card" className="mx-auto" />

            <div className="mt-8 text-center">
                <p className="sm:text-sm">
                    {translate(languageCode, 'updateCard.verification.cardNumber.cardNumberLabel')}
                    <span className="text-orange-700">*</span>
                </p>
                <p className="text-gray-400 sm:text-sm">({translate(languageCode, 'updateCard.verification.cardNumber.cardNumberHint')})</p>
            </div>

            <div className="mx-auto flex w-full sm:w-[350px]">
                <input
                    className={clsx(
                        'rounded h-[40px] w-full mt-2 px-4 text-gray-600 outline-blue-600',
                        'ml-2',
                        valueError && !card
                            ? 'border-red-700 border-2'
                            : 'border-brand-neutral hover:border-black border'
                    )}
                    onChange={(event) => setCard(event.target.value)}
                />
            </div>
            <div className="text-center">
                <button
                    className={clsx(
                        'mx-auto mt-10 bg-brand-primary rounded-3xl p-2 px-10',
                        loading && 'opacity-80 cursor-not-allowed'
                    )}
                    onClick={handleVerify}
                >
                    <span
                        className={clsx(
                            'text-[12px] sm:text-[18px] font-bold text-white',
                            loading && 'opacity-80 cursor-not-allowed'
                        )}
                    >
                        {translate(languageCode, 'updateCard.verification.cardNumber.proceed')}
                    </span>
                </button>
            </div>

            {error && (
                <div className="text-center text-red-700 mt-14">
                    {translate(languageCode, 'updateCard.verification.cardNumber.error')}
                </div>
            )}

            <div className="w-full mt-5 sm:mt-10">
                <p className="text-xs text-orange-700 sm:text-sm">*{translate(languageCode, 'updateCard.verification.cardNumber.requiredFields')}</p>
            </div>
        </>
    );
};

export default CardVerificationBarcode;
