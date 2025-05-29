import React, { useEffect } from 'react';
import clsx from 'clsx';
import { Autocomplete, TextField } from '@mui/material';
import { Box } from '@mui/system';
import { CountryCode } from '../core/models/enums/Country';
import { IDialCode } from '../core/models/IDialCode';
import dialCodes from '../core/data/dialCodes.json';

const DEFAULT_CODE = {
    [CountryCode.Italy]: { name: 'Italy', dial_code: '+39', code: 'IT' },
    [CountryCode.Switzerland]: { name: 'Switzerland', dial_code: '+41', code: 'CH' },
    [CountryCode.Malta]: { name: 'Malta', dial_code: '+356', code: 'MT' },
};

type PhoneNumberProps = {
    countryCode?: CountryCode;
    onChange: (value: string | null, innerValues?: { countryCode: string|null, number: string|null } | null) => void;
    disabled?: boolean;
    error?: boolean;
};

const PhoneNumber = ({
    countryCode = CountryCode.Italy,
    disabled,
    error,
    onChange
}: PhoneNumberProps) => {
    const [phone, setPhone] = React.useState('');
    const [phoneCountryCode, setPhoneCountryCode] = React.useState<string>(
        DEFAULT_CODE[countryCode].dial_code
    );

    useEffect(() => {
        if (!phoneCountryCode || phone.length < 8 || phone.length > 10) {
            onChange(null, { countryCode: phoneCountryCode, number: phone });
        } else if (phoneCountryCode && phone) {
            onChange(phoneCountryCode + phone, { countryCode: phoneCountryCode, number: phone });
        }
    }, [phone, phoneCountryCode]);

    const filterOptions = (options: IDialCode[], { inputValue }: { inputValue: string }) => {
        return options.filter((option) => {
            const nameMatches = option.name?.toLowerCase().includes(inputValue.toLowerCase());
            const dialCodeMatches = option.dial_code?.includes(inputValue);
            return nameMatches || dialCodeMatches;
        });
    };

    return (
        <div className="flex flex-col lg:flex-row gap-2">
            <Autocomplete
                defaultValue={DEFAULT_CODE[countryCode]}
                disablePortal
                disabled={disabled}
                sx={{ minWidth: 125 }}
                size="small"
                options={dialCodes}
                isOptionEqualToValue={(option, value) => option.dial_code === value.dial_code}
                classes={{
                    root: `${error && !phoneCountryCode ? 'error' : ''}`,
                    listbox: 'mui-listbox2',
                    popper: 'mui-listbox2',
                    input: 'mui-input',
                }}
                filterOptions={filterOptions}
                getOptionLabel={(option: IDialCode) => (option ? option?.dial_code ?? '' : '')}
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
                renderOption={(props, option) => {
                    return (
                        <Box
                            {...props}
                            key={`listItem-${option.code}-${option.dial_code}`}
                            component="li"
                            sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                        >
                            <img
                                loading="lazy"
                                width="20"
                                src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
                                srcSet={`https://flagcdn.com/w40/${option.code.toLowerCase()}.png 2x`}
                                alt=""
                            />
                            {option.name} ({option.code}) {option.dial_code}
                        </Box>
                    );
                }}
            />

            <input
                className={clsx(
                    'rounded h-[40px] w-full px-4 text-gray-600',
                    error
                        ? 'border-red-700 outline-red-800 border-2'
                        : 'border-brand-neutral outline-blue-600 hover:border-black border'
                )}
                disabled={disabled}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={phone}
                onChange={(event) => {
                    const numberOnly = event.target.value.replace(/[^0-9]/g, '')
                    setPhone(numberOnly);
                }}
            />
        </div>
    );
};

export default PhoneNumber;
