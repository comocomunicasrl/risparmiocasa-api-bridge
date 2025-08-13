import React from 'react';
import { IPersonDetails } from '../core/models/IPersonDetails';
import { Gender } from '../core/models/enums/Gender';
import Input from './form/Input';
import { IBirthDate } from '../core/models/IBirthDate';
import { getCountryName, isValidDiscount, translate } from '../utils/utils';
import { Autocomplete, TextField } from '@mui/material';
import { IPreferredStore } from '../core/models/IPreferredStore';
import { ICity } from '../core/models/ICity';
import { ICountry } from '../core/models/ICountry';
import { CountryCode } from '../core/models/enums/Country';
import NumberSelect from "./NumberSelect";
import PhoneNumber from "./PhoneNumber";
import ListboxComponent from './form/ListboxComponent';
import InputContainer from './form/Input-container';
import { FieldError, useForm } from 'react-hook-form';
import { withRouter, NextRouter } from 'next/router';
import clsx from 'clsx';

interface WithRouterProps {
    router: NextRouter
}

interface IPersonDetailsProps extends WithRouterProps {
    brand: string;
    countryCode: string;
    personDetails?: IPersonDetails;
    cities: { [key: string]: ICity[] };
    preferredStores: IPreferredStore[];
    countriesOfResidence?: ICountry[] | undefined;
    onSuccess?: (data: IPersonDetails) => void;
    onCancel?: () => void;
    region?: CountryCode;
    storeVersion?: boolean;
    friendPromo?: boolean;
}

const PersonDetails = ({
    brand,
    countryCode,
    personDetails,
    cities,
    preferredStores,
    countriesOfResidence,
    onSuccess,
    onCancel,
    region,
    storeVersion,
    friendPromo,
    router
}: IPersonDetailsProps) => {
    const [person] = React.useState<IPersonDetails>({
        dateOfBirth: {
            day: '',
            year: '',
            month: '',
        } as IBirthDate,
        gender: Gender.None as Gender,
        rules: false,
        marketing: false,
        statistics: false,
        postalCode: '',
        city: null,
        countryOfResidence: region ? region : CountryCode.Italy,
        preferredStoreCode: (preferredStores?.length === 1) ? preferredStores.at(0).id : undefined,
        ...(personDetails ?? {})
    } as IPersonDetails);
    const [phoneAlreadySet] = React.useState(person.phoneNumber != null);
    const [phoneSecondaryAlreadySet] = React.useState(person.phoneNumberSecondary != null);
    const [emailAlreadySet] = React.useState(person.email != null);
    const [loading, setLoading] = React.useState(false);
    const languageCode = (countryCode === 'mt') ? 'en' : 'it';
    const try2025 = router.query.try2025 === 'true';
    const actualUTCDateMs = Date.now();
    const startOf2025Ms =  try2025 ? Date.UTC(2024, 11, 29, 9, 38, 0, 0) : Date.UTC(2024, 11, 31, 23, 0, 0, 0);
    
    const personDataForm = useForm<{
        name: string;
        surname: string;
        gender: Gender;
        email: string;
        city: string;
        postalCode: string;
        address: string;
        streetNumber: string;
        phoneNumber: string;
        phoneNumberSecondary: string;
        countryOfResidence: ICountry;
        preferredStore: IPreferredStore;
        discountCode: string;
        dateOfBirth: IBirthDate;
        rules: boolean;
        marketing: boolean;
        statistics: boolean;
        friendFidelityCard: string|null;
    }>({ 
        defaultValues: { 
            name: person.name,
            surname: person.surname,
            gender: person.gender,
            phoneNumber: person.phoneNumber,
            phoneNumberSecondary: person.phoneNumberSecondary,
            email: person.email,
            countryOfResidence: countriesOfResidence?.find(c => c.code === person.countryOfResidence) ?? { code: person.countryOfResidence, label: getCountryName(person.countryOfResidence) },
            city: person.city,
            postalCode: person.postalCode,
            address: person.address,
            streetNumber: person.streetNumber,
            preferredStore: preferredStores?.find(s => s.id === person.preferredStoreCode),
            dateOfBirth: (person.dateOfBirth && person.dateOfBirth.day && person.dateOfBirth.month && person.dateOfBirth.year) ? person.dateOfBirth : undefined,
            discountCode: person.discountCode,
            rules: person.rules,
            marketing: person.marketing,
            statistics: person.statistics,
            friendFidelityCard: null
        } 
    });

    const personDataFormSubmit = personDataForm.handleSubmit(() => verifyPersonData());
    const formErrorMap = new Map<string, string>([
        [ 'pattern', translate(languageCode, 'common.validity_pattern') ],
        [ 'required', translate(languageCode, 'common.validity_required') ],
        [ 'format', translate(languageCode, 'common.validity_format') ],
        [ 'equality', translate(languageCode, 'common.validity_equality') ],
        [ 'dateValidity', translate(languageCode, 'common.validity_dateValidity') ]
    ]);
    const getErrorText = (error: FieldError, errorMap: Map<string, string>) => {
        if (!error)
            return;

        if (error.message)
            return error.message;

        return errorMap.get(error.type) ?? undefined;
    }

    const verifyPersonData = async () => {
        setLoading(true);

        if (personDataForm.getValues('discountCode') && !(await isValidDiscount(personDataForm.getValues('discountCode'), brand))) {
            window.alert('Codice sconto non valido');
            setLoading(false);
            return;
        }
        
        onSuccess({
            ...personDataForm.getValues(),
            gender: Number(personDataForm.getValues('gender')),
            phoneNumberSecondary: personDataForm.getValues('phoneNumberSecondary') ?? personDataForm.getValues('phoneNumber'),
            countryOfResidence: personDataForm.getValues('countryOfResidence')?.code ?? person.countryOfResidence,
            preferredStore: personDataForm.getValues('preferredStore')?.label ?? person.preferredStore,
            preferredStoreCode: personDataForm.getValues('preferredStore')?.id ?? person.preferredStoreCode
        });
    };

    return (
        <div className="w-full mx-auto mt-4 sm:mt-8">
            <div className="sm:flex">
                <div className="sm:w-1/3 sm:pr-6">
                    <InputContainer
                        inputId="person-name"
                        label={translate(languageCode, 'personalDetails.name')}
                        required={true}
                        errorText={getErrorText(personDataForm.formState.errors?.name, formErrorMap)}
                    >
                        <input autoComplete="off"
                            id="person-name"
                            type="text"
                            className={`rounded h-[40px] w-full mt-2 px-4 text-gray-600 ${
                                personDataForm.getFieldState('name').invalid
                                    ? 'border-red-700 outline-red-800 border-2'
                                    : 'border-brand-neutral outline-blue-600 hover:border-black border'
                            }`}
                            maxLength={100}
                            value={personDataForm.watch('name')}
                            { ...personDataForm.register('name', { required: true, maxLength: 100 }) }
                        />
                    </InputContainer>
                </div>
                <div className="mt-2 sm:mt-0 sm:w-1/3 sm:pr-6">
                    <InputContainer
                        inputId="person-surname"
                        label={translate(languageCode, 'personalDetails.surname')}
                        required={true}
                        errorText={getErrorText(personDataForm.formState.errors?.surname, formErrorMap)}
                    >
                        <input autoComplete="off"
                            id="person-surname"
                            type="text"
                            className={`rounded h-[40px] w-full mt-2 px-4 text-gray-600 ${
                                personDataForm.getFieldState('surname').invalid
                                    ? 'border-red-700 outline-red-800 border-2'
                                    : 'border-brand-neutral outline-blue-600 hover:border-black border'
                            }`}
                            maxLength={100}
                            value={personDataForm.watch('surname')}
                            { ...personDataForm.register('surname', { required: true, maxLength: 100 }) }
                        />
                    </InputContainer>
                </div>
                <div className="mt-2 sm:mt-0 sm:w-1/3">
                    <InputContainer
                        inputId="person-gender-male"
                        label={translate(languageCode, 'personalDetails.gender')}
                        required={true}
                        errorText={getErrorText(personDataForm.formState.errors?.gender, formErrorMap)}
                    >
                        <div className="flex flex-wrap">
                            <div className="flex-1 min-w-[160px]">
                                <div className="flex h-[50px] table-cell align-middle">
                                    <div className="flex justify-center sm:mt-2">
                                        <div className="form-check">
                                            <input
                                                className={`form-check-input appearance-none text-gray-600 rounded-full h-6 w-6 border bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer ${
                                                    personDataForm.formState.errors?.gender
                                                        ? 'border-red-700 border-2'
                                                        : 'border-gray-300 hover:border-black'
                                                }`}
                                                type="radio"
                                                id="person-gender-male"
                                                value={Gender.Male}
                                                { ...personDataForm.register('gender', { required: true }) }
                                            />
                                            <label
                                                className="form-check-label inline-block mt-1 text-gray-600 text-[14px] sm:text-[17px]"
                                                htmlFor="person-gender-male"
                                            >
                                                {translate(languageCode, 'personalDetails.male')}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 min-w-[160px]">
                                <div className="flex h-[50px] table-cell align-middle">
                                    <div className="flex justify-center sm:mt-2">
                                        <div className="form-check">
                                            <input
                                                className={`form-check-input appearance-none text-gray-600 rounded-full h-6 w-6 border bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer ${
                                                    personDataForm.formState.errors?.gender
                                                        ? 'border-red-700 border-2'
                                                        : 'border-gray-300 hover:border-black'
                                                }`}
                                                type="radio"
                                                id="person-gender-female"
                                                value={Gender.Female}
                                                { ...personDataForm.register('gender', { required: true }) }
                                            />
                                            <label
                                                className="form-check-label inline-block mt-1 text-gray-600 text-[14px] sm:text-[17px]"
                                                htmlFor="person-gender-female"
                                            >
                                                {translate(languageCode, 'personalDetails.female')}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 min-w-[160px]">
                                <div className="flex h-[50px] table-cell align-middle">
                                    <div className="flex justify-center sm:mt-2">
                                        <div className="form-check">
                                            <input
                                                className={`form-check-input appearance-none text-gray-600 rounded-full h-6 w-6 border bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer ${
                                                    personDataForm.formState.errors?.gender
                                                        ? 'border-red-700 border-2'
                                                        : 'border-gray-300 hover:border-black'
                                                }`}
                                                type="radio"
                                                id="person-gender-other"
                                                value={Gender.Other}
                                                { ...personDataForm.register('gender', { required: true }) }
                                            />
                                            <label
                                                className="form-check-label inline-block mt-1 text-gray-600 text-[14px] sm:text-[17px]"
                                                htmlFor="person-gender-other"
                                            >
                                                {translate(languageCode, 'personalDetails.unspecified')}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </InputContainer>
                </div>
            </div>
            <div className="mt-4 sm:flex">
                <div className="mt-2 sm:mt-0 sm:w-1/3 sm:pr-6">
                        {(!storeVersion || !phoneAlreadySet) && (
                            <>
                                <InputContainer
                                    inputId="person-phone-number"
                                    label={translate(languageCode, 'personalDetails.phoneNumber')}
                                    required={true}
                                    errorText={getErrorText(personDataForm.formState.errors?.phoneNumber, formErrorMap)}
                                >
                                    <div className="mt-2">
                                        <PhoneNumber
                                            countryCode={region}
                                            error={personDataForm.formState.errors?.phoneNumber ? true : false}
                                            {
                                                ...(() => {
                                                    personDataForm.register('phoneNumber', { required: true });
                                                    return {
                                                        onChange: (phoneNumber, { countryCode, number}) => {
                                                            personDataForm.setValue('phoneNumber', phoneNumber);
                                                            if (personDataForm.formState.isSubmitted) {
                                                                if (!phoneNumber && countryCode && number) {
                                                                    personDataForm.setError('phoneNumber', { message: translate(languageCode, 'common.validity_minLength').replace('{0}', '8') });
                                                                } else {
                                                                    personDataForm.trigger();
                                                                }
                                                            }
                                                        }
                                                    };
                                                })()
                                            }
                                        />
                                    </div>
                                </InputContainer>
                            </>
                        )}
                        {(storeVersion && phoneAlreadySet) && (
                            <>
                                <div className="sm:w-[90%]">
                                    <Input
                                        id="person-phone-number"
                                        label={translate(languageCode, 'personalDetails.phoneNumber')}
                                        value={person.phoneNumber}
                                        disabled={true}
                                        required
                                    />
                                </div>
                            </>
                        )}
                </div>
                <div className="mt-2 sm:mt-0 sm:w-1/3 sm:pr-6">
                        {(!storeVersion || !phoneSecondaryAlreadySet) && (
                            <>
                                <InputContainer
                                    inputId="person-phone-number-secondary"
                                    label={translate(languageCode, 'personalDetails.secondaryPhoneNumber')}
                                    required={false}
                                    errorText={getErrorText(personDataForm.formState.errors?.phoneNumberSecondary, formErrorMap)}
                                >
                                    <div className="mt-2">
                                        <PhoneNumber
                                            countryCode={region}
                                            error={personDataForm.formState.errors?.phoneNumberSecondary ? true : false}
                                            {
                                                ...(() => {
                                                    personDataForm.register('phoneNumberSecondary');
                                                    return {
                                                        onChange: (phoneNumber, { countryCode, number}) => {
                                                            personDataForm.setValue('phoneNumberSecondary', phoneNumber);
                                                            if (personDataForm.formState.isSubmitted) 
                                                                personDataForm.trigger();
                                                        }
                                                    };
                                                })()
                                            }
                                        />
                                    </div>
                                </InputContainer>                           
                            </>
                        )}
                        {(storeVersion && phoneSecondaryAlreadySet) && (
                            <>
                                <div className="sm:w-[90%]">
                                    <Input
                                        id="person-phone-number-secondary"
                                        label={translate(languageCode, 'personalDetails.secondaryPhoneNumber')}
                                        value={person.phoneNumberSecondary}
                                        disabled={true}
                                    />
                                </div>
                            </>
                        )}
                    
                </div>
                {storeVersion && (
                    <>
                        <div className={`mt-2 sm:mt-0 sm:w-1/3 ${countriesOfResidence ? 'sm:pr-6' : ''}`}>
                            <InputContainer
                                inputId="person-email"
                                label={translate(languageCode, 'emailConfirmation.email')}
                                required={true}
                                errorText={getErrorText(personDataForm.formState.errors?.email as any, formErrorMap)}
                            >
                                <div className="">
                                    <input autoComplete="off"
                                        id="person-email"
                                        type="email"
                                        className={`rounded h-[40px] w-full mt-2 px-4 text-gray-600 ${
                                            personDataForm.getFieldState('email').invalid
                                                ? 'border-red-700 outline-red-800 border-2'
                                                : 'border-brand-neutral outline-blue-600 hover:border-black border'
                                        }`}
                                        maxLength={100}
                                        value={personDataForm.watch('email')}
                                        disabled={emailAlreadySet}
                                        { ...personDataForm.register('email', { required: true, maxLength: 100 }) }
                                    />
                                </div>  
                            </InputContainer>
                        </div>
                    </>
                )}
                {countriesOfResidence && (
                    <div className="mt-2 sm:mt-0 sm:w-1/3">
                        <InputContainer
                            inputId="person-phone-number"
                            label={translate(languageCode, 'personalDetails.countryOfResidence')}
                            required={true}
                            errorText={getErrorText(personDataForm.formState.errors?.countryOfResidence as any, formErrorMap)}
                        >
                            <div className="w-full mt-2">
                                <Autocomplete
                                    disablePortal
                                    size={'small'}
                                    options={countriesOfResidence}
                                    classes={{
                                        root: `${
                                            personDataForm.formState.errors?.countryOfResidence ? 'error' : ''
                                        }`,
                                        listbox: 'mui-listbox2',
                                        popper: 'mui-listbox2',
                                        input: 'mui-input',
                                    }}
                                    value={personDataForm.watch('countryOfResidence')}
                                    renderInput={(params) => <TextField {...params} />}
                                    {
                                        ...(() => {
                                            personDataForm.register('countryOfResidence', { required: true });
                                            return {
                                                onChange: (e, value: ICountry) => {
                                                    personDataForm.setValue('countryOfResidence', value);
                                                    personDataForm.setValue('city', null);
                                                    personDataForm.setValue('postalCode', null);
                                                    personDataForm.setValue('address', null);
                                                    personDataForm.setValue('streetNumber', null);
                                                    if (personDataForm.formState.isSubmitted)
                                                        personDataForm.trigger();
                                                }
                                            };
                                        })()
                                    }
                                />
                            </div>
                        </InputContainer>
                    </div>
                )}
            </div>
            <div className="mt-4 sm:flex">
                <div className="mt-2 sm:mt-0 sm:w-1/4 sm:pr-6">
                    <InputContainer
                        inputId="person-city"
                        label={translate(languageCode, 'personalDetails.cityOfResidence')}
                        required={true}
                        errorText={getErrorText(personDataForm.formState.errors?.city as any, formErrorMap)}
                    >
                        <div className="w-full mt-2">
                            <Autocomplete
                                disabled={countriesOfResidence && !personDataForm.watch('countryOfResidence')}
                                size={'small'}
                                disableListWrap
                                classes={{
                                    root: `${personDataForm.formState.errors?.city ? 'error' : ''}`,
                                    listbox: 'mui-listbox',
                                    popper: 'mui-listbox',
                                    input: 'mui-input',
                                }}
                                slotProps={{
                                    listbox: {
                                        component: ListboxComponent,
                                    }
                                }}
                                options={
                                    personDataForm.watch('countryOfResidence')
                                        ? cities[personDataForm.getValues('countryOfResidence').code].map((x) => x.label)
                                        : []
                                }
                                value={personDataForm.watch('city')}
                                renderInput={(params) => <TextField {...params} fullWidth />}
                                {
                                    ...(() => {
                                        personDataForm.register('city', { required: true });
                                        return {
                                            onChange: (e, value: string) => {
                                                personDataForm.setValue('city', value);
                                                personDataForm.setValue('postalCode', null);
                                                if (personDataForm.formState.isSubmitted) 
                                                    personDataForm.trigger();
                                            }
                                        };
                                    })()
                                }
                            />
                        </div>
                    </InputContainer>
                </div>
                <div className="mt-2 sm:mt-0 sm:w-1/4 sm:pr-6">
                    <InputContainer
                        inputId="person-postal-code"
                        label={translate(languageCode, 'personalDetails.postalCode')}
                        required={true}
                        errorText={getErrorText(personDataForm.formState.errors?.postalCode as any, formErrorMap)}
                    >
                        <div className="w-full mt-2">
                            <Autocomplete
                                disabled={countriesOfResidence && !personDataForm.watch('countryOfResidence')}
                                disablePortal
                                size={'small'}
                                options={cities[personDataForm.watch('countryOfResidence')?.code]?.find((c) => c.label === personDataForm.watch('city'))?.cap.map((x, i) => x) ?? []}
                                classes={{
                                    root: `${
                                        personDataForm.formState.errors?.postalCode
                                            ? 'error'
                                            : ''
                                    }`,
                                    listbox: 'mui-listbox2',
                                    popper: 'mui-listbox2',
                                    input: 'mui-input',
                                }}
                                value={personDataForm.watch('postalCode')}
                                renderInput={(params) => <TextField {...params} />}
                                {
                                    ...(() => {
                                        personDataForm.register('postalCode', { required: true });
                                        return {
                                            onChange: (e, value: string) => {
                                                personDataForm.setValue('postalCode', value);
                                                if (personDataForm.formState.isSubmitted) 
                                                    personDataForm.trigger();
                                            }
                                        };
                                    })()
                                }
                            />
                        </div>
                    </InputContainer>
                </div>
                <div className="mt-2 sm:mt-0 sm:w-1/4 sm:pr-6">
                    <InputContainer
                        inputId="person-address"
                        label={translate(languageCode, 'personalDetails.address')}
                        required={true}
                        errorText={getErrorText(personDataForm.formState.errors?.address as any, formErrorMap)}
                    >
                        <input autoComplete="off"
                            id="person-address"
                            type="text"
                            className={`rounded h-[40px] w-full mt-2 px-4 text-gray-600 ${
                                personDataForm.getFieldState('address').invalid
                                    ? 'border-red-700 outline-red-800 border-2'
                                    : 'border-brand-neutral outline-blue-600 hover:border-black border'
                            }`}
                            maxLength={200}
                            value={personDataForm.watch('address')}
                            disabled={countriesOfResidence && !personDataForm.watch('countryOfResidence')}
                            { ...personDataForm.register('address', { required: true, maxLength: 200 }) }
                        />
                    </InputContainer>
                </div>
                <div className="mt-2 sm:mt-0 sm:w-1/4">
                    <InputContainer
                        inputId="person-street-number"
                        label={translate(languageCode, 'personalDetails.street')}
                        required={true}
                        errorText={getErrorText(personDataForm.formState.errors?.streetNumber as any, formErrorMap)}
                    >
                        <input autoComplete="off"
                            id="person-street-number"
                            type="text"
                            className={`rounded h-[40px] w-full mt-2 px-4 text-gray-600 ${
                                personDataForm.getFieldState('streetNumber').invalid
                                    ? 'border-red-700 outline-red-800 border-2'
                                    : 'border-brand-neutral outline-blue-600 hover:border-black border'
                            }`}
                            maxLength={10}
                            value={personDataForm.watch('streetNumber')}
                            disabled={countriesOfResidence && !personDataForm.watch('countryOfResidence')}
                            { ...personDataForm.register('streetNumber', { required: true, maxLength: 10 }) }
                        />
                    </InputContainer>
                </div>
            </div>
            <div className="mt-4 sm:flex">
                {!storeVersion && (preferredStores?.length > 1) && (
                    <div className="mt-2 sm:mt-0 sm:w-1/3 sm:pr-6">
                        <InputContainer
                            inputId="person-preferred-store"
                            label={translate(languageCode, 'personalDetails.preferredStore')}
                            required={true}
                            errorText={getErrorText(personDataForm.formState.errors?.preferredStore as any, formErrorMap)}
                        >
                            <div className="w-full mt-2">
                                <Autocomplete
                                    disablePortal
                                    size={'small'}
                                    options={preferredStores}
                                    classes={{
                                        root: `${
                                            personDataForm.formState.errors?.preferredStore ? 'error' : ''
                                        }`,
                                        listbox: 'mui-listbox2',
                                        popper: 'mui-listbox2',
                                        input: 'mui-input',
                                    }}
                                    value={personDataForm.watch('preferredStore')}
                                    renderInput={(params) => <TextField {...params} />}
                                    {
                                        ...(() => {
                                            personDataForm.register('preferredStore', { required: true });
                                            return {
                                                onChange: (e, value: IPreferredStore) => {
                                                    personDataForm.setValue('preferredStore', value);
                                                    if (personDataForm.formState.isSubmitted)
                                                        personDataForm.trigger();
                                                }
                                            };
                                        })()
                                    }
                                />
                            </div>
                        </InputContainer>
                    </div>
                )}
                <div className="mt-2 sm:mt-0 sm:w-1/3 sm:pr-6">
                    <InputContainer
                        inputId="person-birth-date"
                        label={translate(languageCode, 'personalDetails.dateOfBirth')}
                        required={true}
                        errorText={getErrorText(personDataForm.formState.errors?.dateOfBirth as any, formErrorMap)}
                    >
                        <div className="flex mt-2">
                            <div className="w-1/4">
                                <NumberSelect
                                    options={Array.from({ length: 31 }, (_, i) => `${(i + 1).toFixed(0).padStart(2, '0')}`)}
                                    label={translate(languageCode, 'personalDetails.dateOfBirthDay')}
                                    error={personDataForm.formState.errors?.dateOfBirth ? true : false}
                                    value={personDataForm.watch('dateOfBirth')?.day}
                                    {
                                        ...(() => {
                                            personDataForm.register('dateOfBirth', { required: true, validate: { dateValidity: (v) => {
                                                return (v.day && v.month && v.year) ? true : false;
                                            }}});
                                            return {
                                                onChange: (value: string) => {
                                                    const actualDate = personDataForm.watch('dateOfBirth');
                                                    personDataForm.setValue('dateOfBirth', { day: value, month: actualDate?.month, year: actualDate?.year });
                                                    if (personDataForm.formState.isSubmitted)
                                                        personDataForm.trigger();
                                                }
                                            };
                                        })()
                                    }
                                />
                            </div>
                            <div className="w-1/4">
                                <NumberSelect
                                    options={Array.from({ length: 12 }, (_, i) => `${(i + 1).toFixed(0).padStart(2, '0')}`)}
                                    label={translate(languageCode, 'personalDetails.dateOfBirthMonth')}
                                    error={personDataForm.formState.errors?.dateOfBirth ? true : false}
                                    value={personDataForm.watch('dateOfBirth')?.month}
                                    onChange={(value: string) => {
                                        const actualDate = personDataForm.watch('dateOfBirth');
                                        personDataForm.setValue('dateOfBirth', { day: actualDate?.day, month: value, year: actualDate?.year });
                                        if (personDataForm.formState.isSubmitted)
                                            personDataForm.trigger();
                                    }}
                                />
                            </div>
                            <div className="w-1/2">
                                <NumberSelect
                                    options={Array.from(
                                        { length: 2006 - 1914 + 1 },
                                        (_, i) => `${1914 + i}`
                                    ).reverse()}
                                    label={translate(languageCode, 'personalDetails.dateOfBirthYear')}
                                    error={personDataForm.formState.errors?.dateOfBirth ? true : false}
                                    value={personDataForm.watch('dateOfBirth')?.year}
                                    onChange ={(value: string) => {
                                        const actualDate = personDataForm.watch('dateOfBirth');
                                        personDataForm.setValue('dateOfBirth', { day: actualDate?.day, month: actualDate?.month, year: value });
                                        if (personDataForm.formState.isSubmitted)
                                            personDataForm.trigger();
                                    }}
                                />
                            </div>
                        </div>

                    </InputContainer>
                </div>
                <div className="mt-2 sm:mt-0 sm:w-1/3">
                    {friendPromo && (
                        <InputContainer
                            inputId="person-friend-fidelity-card"
                            label={translate(languageCode, 'personalDetails.friendFidelityCard')}
                            required={false}
                            errorText={getErrorText(personDataForm.formState.errors?.friendFidelityCard as any, formErrorMap)}
                        >
                        <input autoComplete="off"
                                id="person-friend-fidelity-card"
                                type="tel"
                                maxLength={13}
                                className={`rounded h-[40px] w-full mt-2 px-4 text-gray-600 ${
                                    personDataForm.getFieldState('friendFidelityCard').invalid
                                        ? 'border-red-700 outline-red-800 border-2'
                                        : 'border-brand-neutral outline-blue-600 hover:border-black border'
                                }`}
                                value={personDataForm.watch('friendFidelityCard')}
                                { ...personDataForm.register('friendFidelityCard') }
                            /> 
                        </InputContainer>
                    )}

                    {!friendPromo && (
                        <InputContainer
                            inputId="person-discount-code"
                            label={translate(languageCode, 'personalDetails.discountCode')}
                            required={false}
                            errorText={getErrorText(personDataForm.formState.errors?.discountCode as any, formErrorMap)}
                        >
                        <input autoComplete="off"
                                id="person-discount-code"
                                type="text"
                                className={`rounded h-[40px] w-full mt-2 px-4 text-gray-600 ${
                                    personDataForm.getFieldState('discountCode').invalid
                                        ? 'border-red-700 outline-red-800 border-2'
                                        : 'border-brand-neutral outline-blue-600 hover:border-black border'
                                }`}
                                value={personDataForm.watch('discountCode')}
                                { ...personDataForm.register('discountCode') }
                            /> 
                        </InputContainer>
                    )}
                </div>
            </div>
            <div className="mt-6">
                <InputContainer
                        inputId="person-rules"
                        required={false}
                        errorText={getErrorText(personDataForm.formState.errors?.rules as any, formErrorMap)}
                >
                    <div className="flex form-check">
                    
                        <input
                            className={`form-check-input appearance-none h-[20px] min-w-[20px] sm:h-[30px] sm:min-w-[30px] border rounded-sm
                                bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200
                                mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer ${
                                    personDataForm.formState.errors?.rules
                                        ? 'border-red-700 border-2'
                                        : 'border-gray-300 hover:border-black'
                                }`}
                            type="checkbox"
                            id="person-rules"
                            checked={personDataForm.watch('rules')}
                            { ...personDataForm.register('rules', { required: true }) }
                        />
                        <label
                            className="form-check-label text-gray-600 inline-block text-[12px] sm:text-[17px] leading-[20px] sm:leading-[30px] mt-1"
                            htmlFor="person-rules"
                        >
                            {translate(languageCode, 'personalDetails.consentToDataProcessingOne')}{' '}
                            <a
                                target="_blank"
                                href={
                                    region === CountryCode.Switzerland
                                        ? '/regolamento-fidelity-svizzera-risparmio-casa.pdf'
                                        : region === CountryCode.Malta
                                        ? '/regulation-loyalty-card.pdf'
                                        : '/93082244-regolamento-carta-risparmio-insieme-2022.pdf'
                                }
                                className="text-blue-600 hover:underline hover:cursor-pointer"
                                rel="noreferrer"
                            >
                                {translate(languageCode, 'personalDetails.consentToDataProcessingTwo')}
                            </a>
                            <span className="text-orange-700">*</span>
                        </label>
                    </div>
                </InputContainer>
            </div>
            <div className="mt-4">
                <div className="flex form-check">
                    <input
                        className="form-check-input hover:border-black appearance-none h-[20px] min-w-[20px] sm:h-[30px] sm:min-w-[30px] border rounded-sm
                            bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200
                            mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer border-gray-300"
                        type="checkbox"
                        checked={personDataForm.watch('marketing')}
                            { ...personDataForm.register('marketing') }
                        id="person-marketing-confirmation"
                    />
                    <label
                        className="form-check-label text-gray-600 inline-block text-[12px] sm:text-[17px] leading-[20px] sm:leading-[30px] mt-1"
                        htmlFor="person-marketing-confirmation"
                    >
                        {translate(languageCode, 'personalDetails.consentToMarketingOne')}{' '}
                        {(brand === 'rica') && (<a
                            href={
                                region === CountryCode.Switzerland
                                            ? '/regolamento-2025-CH.pdf'
                                            : region === CountryCode.Malta
                                            ? '/regolamento-2025-MT.pdf'
                                            : '/regolamento-2025-IT.pdf'
                            }
                            target="_blank"
                            className="text-blue-600 hover:underline hover:cursor-pointer"
                            rel="noreferrer"
                        >
                            {translate(languageCode, 'personalDetails.consentToMarketingTwo')}
                        </a>)}
                        {(brand === 'uniprice') && (<a
                            href="/regolamento-2025-IT-uniprice.pdf"
                            target="_blank"
                            className="text-blue-600 hover:underline hover:cursor-pointer"
                            rel="noreferrer"
                        >
                            {translate(languageCode, 'personalDetails.consentToMarketingTwo')}
                        </a>)}{' '}
                        {translate(languageCode, 'personalDetails.consentToMarketingThree')}
                    </label>
                </div>
            </div>
            <div className="mt-4">
                <div className="flex form-check">
                    <input
                        className="form-check-input hover:border-black appearance-none h-[20px] min-w-[20px] sm:h-[30px] sm:min-w-[30px] border rounded-sm
                            bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200
                            mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer border-gray-300"
                        type="checkbox"
                        checked={personDataForm.watch('statistics')}
                        { ...personDataForm.register('statistics') }
                        id="person-statistics-confirmation"
                    />
                    <label
                        className="form-check-label text-gray-600 inline-block text-[12px] sm:text-[17px] leading-[20px] sm:leading-[30px] mt-1"
                        htmlFor="person-statistics-confirmation"
                    >
                        {translate(languageCode, 'personalDetails.consentToStatisticsOne')}{' '}
                        {(brand === 'rica') && (<a
                            href={
                                region === CountryCode.Switzerland
                                    ? '/regolamento-2025-CH.pdf'
                                    : region === CountryCode.Malta
                                    ? '/regolamento-2025-MT.pdf'
                                    : '/regolamento-2025-IT.pdf'
                            }
                            target="_blank"
                            className="text-blue-600 hover:underline hover:cursor-pointer"
                            rel="noreferrer"
                        >
                            {translate(languageCode, 'personalDetails.consentToStatisticsTwo')}
                        </a>)}
                        {(brand === 'uniprice') && (<a
                            href="/regolamento-2025-IT-uniprice.pdf"
                            target="_blank"
                            className="text-blue-600 hover:underline hover:cursor-pointer"
                            rel="noreferrer"
                        >
                            {translate(languageCode, 'personalDetails.consentToStatisticsTwo')}
                        </a>)}{' '}
                        {translate(languageCode, 'personalDetails.consentToStatisticsThree')}
                    </label>
                </div>
            </div>
            <div className="text-center flex flex-row justify-center gap-8 gap-y-0 flex-wrap-reverse">
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
                    className={`mt-5 md:mt-10 bg-brand-primary rounded-3xl p-2 px-10 ${
                        loading ? 'opacity-80 cursor-not-allowed' : ''
                    }`}
                    onClick={async (e) => {
                        if (!loading) personDataFormSubmit(e);
                    }}
                >
                    <span className="text-[12px] sm:text-[18px] font-bold text-white">
                        {translate(languageCode, 'personalDetails.proceed')}
                    </span>
                </button>
            </div>
            {loading && (
                <div className="relative inline-block w-full mx-auto mt-4 text-center">
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
                            {translate(languageCode, 'personalDetails.loading')}...
                        </p>
                    </div>
                </div>
            )}
            <div className="w-full mt-5 sm:mt-10">
                <p className="text-xs text-orange-700 sm:text-sm">
                    *{translate(languageCode, 'personalDetails.requiredFields')}
                </p>
            </div>
        </div>
    );
};
export default withRouter(PersonDetails);
