import { IDialCode } from '../../../core/models/IDialCode';
import React from 'react';
import clsx from 'clsx';
import axios from 'axios';
import { Autocomplete, TextField } from '@mui/material';
import { Box } from '@mui/system';
import {CountryCode} from "../../../core/models/enums/Country";
import {translate} from "../../../utils/utils";
import {TranslationLanguageCode} from "../../../core/models/enums/Translation";

const DEFAULT_CODE = {
    [CountryCode.Italy]:  { name: 'Italy', dial_code: '+39', code: 'IT' },
    [CountryCode.Switzerland]: { name: 'Switzerland', dial_code: '+41', code: 'CH'},
    [CountryCode.Malta]: { name: "Malta", dial_code: "+356", code: 'MT' },
}

const PhoneNumberInput = ({
    phoneNumberInputTitle,
    confirmButtonLabel,
    dialCodes,
    countryCode = CountryCode.Italy,
    languageCode = TranslationLanguageCode.It,
    onSuccess,
}: {
    phoneNumberInputTitle?: string;
    confirmButtonLabel?: string;
    dialCodes: IDialCode[];
    countryCode?: CountryCode|string;
    languageCode?: TranslationLanguageCode;
    onSuccess: (verifiedPhone: string) => void;
}) => {
    const [loading, setLoading] = React.useState(false);
    const [phone, setPhone] = React.useState('');
    const [phoneCountryCode, setPhoneCountryCode] = React.useState<string>(DEFAULT_CODE[countryCode].dial_code);
    const [error, setError] = React.useState(false);
    const [valueError, setValueError] = React.useState(false);

    const isInputValid = (): boolean => {
        setError(false);
        setValueError(false);

        if (phone?.trim().length < 8 || phone?.trim().length > 10 || phoneCountryCode?.trim().length === 0) {
            setValueError(true);
            return false;
        }
        return true;
    };

    function request2FA(): Promise<boolean> {
        if (!isInputValid()) {
            return;
        }

        setLoading(true);
        const result = axios
            .post('/api/2fa-request', {
                phoneNumber: phoneCountryCode + phone,
                languageCode,
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
                <p className="text-[14px] sm:text-[17px] text-gray-600">
                    {phoneNumberInputTitle ?? translate(languageCode, 'phoneNumberInput.label')}
                    <span className="text-orange-700">*</span>
                </p>
            </div>
            <div className="mx-auto flex w-full sm:w-[500px] mt-4">
                <Autocomplete
                    defaultValue={DEFAULT_CODE[countryCode]}
                    disablePortal
                    size="small"
                    sx={{ width: 350 }}
                    options={dialCodes}
                    isOptionEqualToValue={(option, value) => option.dial_code === value.dial_code}
                    classes={{
                        root: clsx(valueError && !phoneCountryCode && 'error'),
                        listbox: 'mui-listbox2',
                        popper: 'mui-listbox2',
                        input: 'mui-input',
                    }}
                    getOptionLabel={(option) => `${option.name} ${option.dial_code}`}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            inputProps={{
                                ...params.inputProps,
                                autoComplete: 'new-password', // disable autocomplete and autofill
                            }}
                        />
                    )}
                    onChange={(_e, value) => setPhoneCountryCode((value as IDialCode)?.dial_code)}
                    renderOption={(props, option) => (
                        <Box component="li" sx={{ '& > img': { mr: 2, flexShrink: 0 } }} {...props}>
                            <img
                                loading="lazy"
                                width="20"
                                src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                                srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                                alt=""
                            />
                            {option.name} ({option.code}) {option.dial_code}
                        </Box>
                    )}
                />

                <input
                    className={clsx(
                        'rounded h-[40px] w-full px-4 text-gray-600 outline-blue-600',
                        'ml-2',
                        valueError && (!phone || phone.length < 8 || phone.length > 10)
                            ? 'border-red-700 border-2'
                            : 'border-risparmiocasa-neutral hover:border-black border'
                    )}
                    maxLength={10}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={phone}
                    onChange={(event) => {
                        const numberOnly = event.target.value.replace(/[^0-9]/g, '')
                        setPhone(numberOnly);
                    }}
                />
            </div>

            <div className="text-center">
                <button
                    className={clsx(
                        'mx-auto mt-10 md:mt-28 bg-risparmiocasa-blue rounded-3xl p-2 px-10',
                        loading && 'opacity-80 cursor-not-allowed'
                    )}
                    onClick={async () => {
                        if (loading) return;

                        if (await request2FA()) {
                            onSuccess(phoneCountryCode + phone);
                        }
                    }}
                >
                    <span className="text-[12px] sm:text-[18px] font-bold text-white">{confirmButtonLabel ?? translate(languageCode, 'common.proceed')}</span>
                </button>
            </div>

            {error && (
                <div className="text-center text-red-700 mt-14">
                    {translate(languageCode, 'updateCard.verification.phoneNumber.error')}
                </div>
            )}
            
            <div className="w-full mt-5 sm:mt-10 text-left">
                <p className="text-xs sm:text-sm text-orange-700">*{translate(languageCode, 'common.requiredFields')}</p>
            </div>
        </>
    );
};

export default PhoneNumberInput;
