import { useState } from "react";
import { IPersonDetails } from "../core/models/IPersonDetails";
import Input from "./form/Input";
import clsx from 'clsx';
import { translate } from "../utils/utils";
import axios from 'axios';
import { EmailProvider } from "../core/models/EmailProvider";
// @ts-ignore
import Quagga from 'quagga';

interface CardNumberProps {
    brand: string;
    personDetails: IPersonDetails;
    countryCode: string;
    onSuccess?: (value: IPersonDetails) => void;
    onCancel?: () => void;
};

const CardNumber = ({ brand, personDetails, countryCode, onSuccess, onCancel }: CardNumberProps) => {
    const [error, setError] = useState(false);
    const [errorText, setErrorText] = useState(null);
    const [insertMode, setInsertMode] = useState<'manual'|'scan'>('manual');
    const [cardNumber, setCardNumber] = useState<string>();
    const [repeatedCardNumber, setRepeatedCardNumber] = useState<string>();
    const [loading, setLoading] = useState(false);
    const languageCode = (countryCode === 'mt') ? 'en' : 'it';

    const updateCard = () => {
        if (loading === true)
            return;

        if (!cardNumber || !repeatedCardNumber) {
            setErrorText(translate(languageCode, 'common.notValidData') as any);
            setError(true);
            return;
        }

        setErrorText(null);
        setError(false);
        setLoading(true);
        axios.post('/api/update-card-store', {
            details: {
                ...personDetails,
                registrationCountry: countryCode,
                cardNumber
            },
            brand,
            provider: EmailProvider.SendGrid,
        })
        .then((response) => {
            setLoading(false);
            onSuccess({
                ...personDetails,
                registrationCountry: countryCode,
                cardNumber,
            });
        })
        .catch(() => {
            setLoading(false);
            setErrorText(translate(languageCode, 'common.serverComError') as any);
            setError(true);
        });
    };

    const initScanner = () => {
        setInsertMode('scan');
        setCardNumber(null);
        setRepeatedCardNumber(null);
        
        try {
            Quagga.init({
                inputStream : {
                name : "Live",
                type : "LiveStream",
                target: '#scanner'   // Or '#yourElement' (optional)
                },
                decoder : {
                readers : ["ean_reader"]
                }
            }, function(err) {
                if (err) {
                    console.log(err);
                    setInsertMode('manual');
                    return;
                }
                
                Quagga.start();
            });
        } catch(e) {
            setInsertMode('manual');
        }
    };

    const stopScanner = () => {
        Quagga.stop();
        setInsertMode('manual');
    };

    Quagga.onDetected((data) => {
        Quagga.stop();
        setCardNumber(data?.codeResult?.code);
        setRepeatedCardNumber(data?.codeResult?.code);
        setInsertMode('manual');
    });

    return (
        <div className="flex flex-col max-w-full relative justify-center items-center">
            <div className="text-xl font-bold text-center mb-8">{translate(languageCode, 'cardNumber.insertIdCard')}</div>
            <div id="scanner" className={`relative max-h-[280px] overflow-hidden ${(insertMode === 'manual') ? 'hidden' : ''}`}></div>
            {(insertMode === 'scan') && (
                <>
                    <button
                        className={clsx(
                            'mx-auto mt-10 sm:mt-28 bg-slate-200 rounded-3xl p-2 px-10',
                            loading && 'opacity-80 cursor-not-allowed'
                        )}
                        onClick={() => stopScanner()}
                    >
                        <span className="text-[12px] sm:text-[18px] font-bold text-brand-primary">{translate(languageCode, 'common.cancel')?.toUpperCase()}</span>
                    </button>
                </>
            )}
            {/* <div className="flex flex-row flex-wrap gap-8 justify-center">
                <label className="form-check-label text-gray-600 text-[14px] sm:text-[17px] flex flex-row gap-2 items-center">
                    <input className={`form-check-input appearance-none text-gray-600 rounded-full h-6 w-6 border bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 align-top bg-no-repeat bg-center bg-contain float-left cursor-pointer border-gray-300 hover:border-black`}
                        type="radio" 
                        name="insertMode" 
                        value="manual"
                        checked={insertMode === 'manual'}
                        onChange={() =>
                            setInsertMode('manual')
                        }
                    ></input>
                    Inserisci codice manualmente
                </label>
                <label className="form-check-label text-gray-600 text-[14px] sm:text-[17px] flex flex-row gap-2 items-center">
                    <input className={`form-check-input appearance-none text-gray-600 rounded-full h-6 w-6 border bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 align-top bg-no-repeat bg-center bg-contain float-left cursor-pointer border-gray-300 hover:border-black`}
                            type="radio" 
                            name="insertMode" 
                            value="scan"
                            disabled={true}
                            checked={insertMode === 'scan'}
                            onChange={() =>
                                setInsertMode('scan')
                            }
                    ></input>
                    Scannerizza codice (Tablet e Mobile)
                </label>
            </div> */}
            {(insertMode === 'manual') && (
                <>
                    <div className="w-full text-center">
                        <div className="mx-auto mt-4 sm:mt-8 sm:w-1/3">
                            <Input
                                id="cardNumber"
                                label={translate(languageCode, 'cardNumber.idCard')}
                                disabled={insertMode != 'manual'}
                                required
                                error={error && !cardNumber}
                                value={cardNumber}
                                onChange={(code) => setCardNumber(code)}
                            /> 
                        </div>
                        <div className="mx-auto mt-4 sm:mt-8 sm:w-1/3">
                            <Input
                                id="repeatedCardNumber"
                                label={translate(languageCode, 'cardNumber.repeatIdCard')}
                                disabled={insertMode != 'manual'}
                                required
                                error={error && !cardNumber}
                                value={repeatedCardNumber}
                                onChange={(code) => setRepeatedCardNumber(code)}
                            /> 
                        </div>
                    </div>

                    {(insertMode === 'manual') && (
                        <>
                            <div className="text-center">
                                <button
                                    className={clsx(
                                        'block md:hidden mx-auto mt-10 bg-slate-200 rounded-3xl p-2 px-10',
                                        loading && 'opacity-80 cursor-not-allowed'
                                    )}
                                    onClick={() => initScanner()}
                                >
                                    <span className="text-[12px] sm:text-[18px] font-bold text-brand-primary">{translate(languageCode, 'common.use_camera')?.toUpperCase()}</span>
                                </button>
                            </div>
                            <div className="text-center flex flex-row gap-8 gap-y-0 flex-wrap-reverse">
                                <button
                                    className={clsx(
                                        'mx-auto mt-14 md:mt-28 bg-red-800 rounded-3xl p-2 px-10',
                                        loading && 'opacity-80 cursor-not-allowed'
                                    )}
                                    onClick={() => onCancel()}
                                >
                                    <span className="text-[12px] sm:text-[18px] font-bold text-white">{translate(languageCode, 'common.cancel')?.toUpperCase()}</span>
                                </button>
                                <button
                                    className={clsx(
                                        'hidden md:block mx-auto md:mt-28 bg-slate-200 rounded-3xl p-2 px-10',
                                        loading && 'opacity-80 cursor-not-allowed'
                                    )}
                                    onClick={() => initScanner()}
                                >
                                    <span className="text-[12px] sm:text-[18px] font-bold text-brand-primary">{translate(languageCode, 'common.use_camera')?.toUpperCase()}</span>
                                </button>
                                <button
                                    className={clsx(
                                        'mx-auto mt-14 md:mt-28 bg-brand-primary rounded-3xl p-2 px-10',

                                        loading && 'opacity-80 cursor-not-allowed'
                                    )}
                                    onClick={() => updateCard()}
                                >
                                    <span className="text-[12px] sm:text-[18px] font-bold text-white">{translate(languageCode, 'common.next_step')?.toUpperCase()}</span>
                                </button>
                            </div>
                        </>
                    )}
                </>
            )}

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
                            {translate('it', 'emailConfirmation.loading')}...
                        </p>
                    </div>
                </div>
            )}

            {error && (
                <div className="text-center text-red-700 mt-14">
                    {errorText ?? 'Error!'}
                </div>
            )}
        </div>
    );
};

export default CardNumber;