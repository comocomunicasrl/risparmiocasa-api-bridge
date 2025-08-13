import React from 'react';
import { IPersonDetails } from '../../core/models/IPersonDetails';
import { Gender } from '../../core/models/enums/Gender';
import Input from '../form/Input';
import { IBirthDate } from '../../core/models/IBirthDate';
import {isValidBirthDate, isValidDiscount, translate} from '../../utils/utils';
import {Autocomplete, TextField} from '@mui/material';
import { IPreferredStore } from '../../core/models/IPreferredStore';
import { ICity } from '../../core/models/ICity';
import { IVerifiedCardData } from '../../core/models/IVerifiedCardData';
import clsx from 'clsx';
import {ICountry} from "../../core/models/ICountry";
import {CountryCode} from "../../core/models/enums/Country";
import { TranslationLanguageCode } from "../../core/models/enums/Translation";
import NumberSelect from "../NumberSelect";
import ListboxComponent from '../form/ListboxComponent';
import { withRouter, NextRouter } from 'next/router';

interface WithRouterProps {
    router: NextRouter
}

interface IPersonDetailsProps extends WithRouterProps {
    brand: string;
    cities: { [key: string]: ICity[] };
    languageCode?: TranslationLanguageCode,
    region?: CountryCode;
    preferredStores: IPreferredStore[];
    countriesOfResidence?: ICountry[] | undefined;
    onSuccess?: (data: IPersonDetails) => void;
    verifiedCardData: IVerifiedCardData;
}

const CardUpdateWizardItem = ({
    brand,
    cities,
    languageCode = TranslationLanguageCode.It,
    region,
    preferredStores,
    countriesOfResidence,
    onSuccess,
    verifiedCardData,
    router
}: IPersonDetailsProps) => {
    const [error, setError] = React.useState(false);
    const [discountError, setDiscountError] = React.useState(false);
    const [person, setPerson] = React.useState<IPersonDetails>({
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
        phoneNumber: verifiedCardData.verifiedPhoneNumber,
        phoneNumberSecondary: verifiedCardData.verifiedPhoneNumber,
        cardNumber: verifiedCardData.verifiedCardNumber,
        countryOfResidence: region ? region : CountryCode.Italy,
    } as IPersonDetails);

    const [availableCAP, setAvailableCAP] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const try2025 = router.query.try2025 === 'true';
    const actualUTCDateMs = Date.now();
    const startOf2025Ms =  try2025 ? Date.UTC(2024, 11, 29, 9, 38, 0, 0) : Date.UTC(2024, 11, 31, 23, 0, 0, 0);

    React.useEffect(() => {
        setPerson({ ...person, postalCode: '' });
        const residence = person.countryOfResidence;

        if (!residence) {
            return;
        }

        const city = cities[residence].find((x) => x.label === person.city);
        if (!city) {
            setAvailableCAP([]);
            return;
        }
        setAvailableCAP(
            city.cap.map((x, i) => {
                return { label: x, id: i };
            })
        );
    }, [person.city]);

    const verifyPersonData = async () => {
        setLoading(true);
        if (
            !person.name ||
            !person.surname ||
            !person.phoneNumber ||
            !person.gender ||
            !person.city ||
            !person.postalCode ||
            !person.address ||
            !person.streetNumber ||
            !person.preferredStore ||
            !person.rules ||
            !person.countryOfResidence ||
            !isValidBirthDate(person.dateOfBirth)
        ) {
            setError(true);
            setLoading(false);
        } else {
            if (person.discountCode && !(await isValidDiscount(person.discountCode, brand))) {
                setDiscountError(true);
                setLoading(false);
                return;
            }
            if (!person.phoneNumberSecondary) {
                person.phoneNumberSecondary = person.phoneNumber;
            }
            onSuccess(person);
        }
    };

    return (
        <div className="w-full mx-auto mt-4 sm:mt-8">
            <div className="flex h-[50px]">
                <div className="h-[50px] sm:text-[17px] text-gray-600">Fidelity:</div>
                <div
                    className={clsx(
                        'h-[50px] sm:text-[17px] px-4 text-gray-600 outline-blue-600 font-bold'
                    )}
                >
                    {person.cardNumber}
                </div>
            </div>
            <div className="sm:flex">
                <div className="sm:w-1/3">
                    <Input
                        id="person-name"
                        label={translate(languageCode, 'personalDetails.name')}
                        required
                        error={error && !person.name}
                        onChange={(name) => setPerson({ ...person, name })}
                    />
                </div>
                <div className="mt-2 sm:mt-0 sm:w-1/3">
                    <Input
                        id="person-surname"
                        label={translate(languageCode, 'personalDetails.surname')}
                        required
                        error={error && !person.surname}
                        onChange={(surname) => setPerson({ ...person, surname })}
                    />
                </div>
                <div className="mt-2 sm:mt-0 sm:w-1/3">
                    <label
                        htmlFor="person-gender"
                        className="text-[14px] sm:text-[17px] text-gray-600"
                    >
                        {translate(languageCode, 'personalDetails.gender')}:
                        <span className="text-orange-700">*</span>
                    </label>
                    <div className="flex flex-wrap">
                        <div className="flex-1 min-w-[160px]">
                            <div className="flex h-[50px] table-cell align-middle">
                                <div className="flex justify-center sm:mt-2">
                                    <div className="form-check">
                                        <input
                                            className={`form-check-input appearance-none text-gray-600 rounded-full h-6 w-6 border bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer ${
                                                error && person.gender === Gender.None
                                                    ? 'border-red-700 border-2'
                                                    : 'border-gray-300 hover:border-black'
                                            }`}
                                            type="radio"
                                            id="person-gender-male"
                                            checked={person.gender === Gender.Male}
                                            onChange={() =>
                                                setPerson({
                                                    ...person,
                                                    gender: Gender.Male,
                                                })
                                            }
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
                                                error && person.gender === Gender.None
                                                    ? 'border-red-700 border-2'
                                                    : 'border-gray-300 hover:border-black'
                                            }`}
                                            type="radio"
                                            id="person-gender-female"
                                            checked={person.gender === Gender.Female}
                                            onChange={() =>
                                                setPerson({
                                                    ...person,
                                                    gender: Gender.Female,
                                                })
                                            }
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
                                                error && person.gender === Gender.None
                                                    ? 'border-red-700 border-2'
                                                    : 'border-gray-300 hover:border-black'
                                            }`}
                                            type="radio"
                                            id="person-gender-other"
                                            checked={person.gender === Gender.Other}
                                            onChange={() =>
                                                setPerson({
                                                    ...person,
                                                    gender: Gender.Other,
                                                })
                                            }
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
                </div>
            </div>
            <div className="mt-4 sm:flex">
                <div className="mt-2 sm:mt-0 sm:w-1/3">
                    <Input
                        disabled
                        id="person-phone-number"
                        label={translate(languageCode, 'personalDetails.phoneNumber')}
                        value={person.phoneNumber}
                    />
                </div>
                <div className="mt-2 sm:mt-0 sm:w-1/3">
                    <Input
                        disabled
                        id="person-phone-number-secondary"
                        label={translate(languageCode, 'personalDetails.secondaryPhoneNumber')}
                        value={person.phoneNumberSecondary}
                    />
                </div>
                {countriesOfResidence && (
                    <div className="mt-2 sm:mt-0 sm:w-1/3">
                        <label className="text-[14px] sm:text-[17px] text-gray-600">
                            {translate(languageCode, 'personalDetails.countryOfResidence')}:
                            <span className="text-orange-700">*</span>
                        </label>
                        <div className="w-full mt-2">
                            <Autocomplete
                                disablePortal
                                size={'small'}
                                options={countriesOfResidence}
                                classes={{
                                    root: `sm:w-[90%] ${
                                        error && !person.countryOfResidence ? 'error' : ''
                                    }`,
                                    listbox: 'mui-listbox2',
                                    popper: 'mui-listbox2',
                                    input: 'mui-input',
                                }}
                                inputValue={
                                    countriesOfResidence.find(
                                        (country) => country.code === person.countryOfResidence
                                    )?.label || ''
                                }
                                renderInput={(params) => <TextField {...params} />}
                                onChange={(_e, value: ICountry) => {
                                    setPerson({
                                        ...person,
                                        countryOfResidence: (value?.code as CountryCode) ?? '',
                                        city: null,
                                        postalCode: '',
                                    });
                                }}
                            />
                        </div>
                    </div>
                )}
            </div>
            <div className="mt-4 sm:flex">
                <div className="mt-2 sm:mt-0 sm:w-1/4">
                    <label className="text-[14px] sm:text-[17px] text-gray-600">
                        {translate(languageCode, 'personalDetails.cityOfResidence')}:
                        <span className="text-orange-700">*</span>
                    </label>
                    <div className="w-full mt-2">
                        <Autocomplete
                            disabled={countriesOfResidence && !person.countryOfResidence}
                            size={'small'}
                            disableListWrap
                            classes={{
                                root: `sm:w-[90%] ${error && !person.city ? 'error' : ''}`,
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
                                person.countryOfResidence
                                    ? cities[person.countryOfResidence].map((x) => x.label)
                                    : []
                            }
                            renderInput={(params) => <TextField {...params} fullWidth />}
                            onChange={(_e, value) =>
                                setPerson({
                                    ...person,
                                    city: value,
                                })
                            }
                        />
                    </div>
                </div>
                <div className="mt-2 sm:mt-0 sm:w-1/4">
                    <label className="text-[14px] sm:text-[17px] text-gray-600">
                        {translate(languageCode, 'personalDetails.postalCode')}:
                        <span className="text-orange-700">*</span>
                    </label>
                    <div className="w-full mt-2">
                        <Autocomplete
                            disablePortal
                            size={'small'}
                            options={availableCAP}
                            classes={{
                                root: `sm:w-[90%] ${
                                    (error && !person.city) ||
                                    (error && person.city && !person.postalCode)
                                        ? 'error'
                                        : ''
                                }`,
                                listbox: 'mui-listbox2',
                                popper: 'mui-listbox2',
                                input: 'mui-input',
                            }}
                            inputValue={person.postalCode}
                            renderInput={(params) => <TextField {...params} />}
                            onChange={(_e, value) => {
                                setPerson({ ...person, postalCode: value?.label ?? '' });
                            }}
                        />
                    </div>
                </div>
                <div className="mt-2 sm:mt-0 sm:w-1/4">
                    <Input
                        id="person-address"
                        label={translate(languageCode, 'personalDetails.address')}
                        disabled={countriesOfResidence && !person.countryOfResidence}
                        required
                        error={error && !person.address}
                        onChange={(address) => setPerson({ ...person, address })}
                    />
                </div>
                <div className="mt-2 sm:mt-0 sm:w-1/4">
                    <div className="w-[97%]">
                        <Input
                            id="person-street-number"
                            disabled={countriesOfResidence && !person.countryOfResidence}
                            label={translate(languageCode, 'personalDetails.street')}
                            required
                            error={error && !person.streetNumber}
                            onChange={(streetNumber) => setPerson({ ...person, streetNumber })}
                        />
                    </div>
                </div>
            </div>
            <div className="mt-4 sm:flex">
                <div className="mt-2 sm:mt-0 sm:w-1/3">
                    <label className="text-[14px] sm:text-[17px] text-gray-600">
                        {translate(languageCode, 'personalDetails.preferredStore')}:
                        <span className="text-orange-700">*</span>
                    </label>
                    <div className="w-full mt-2">
                        <Autocomplete
                            disablePortal
                            size={'small'}
                            options={preferredStores}
                            classes={{
                                root: `sm:w-[90%] ${
                                    error && !person.preferredStore ? 'error' : ''
                                }`,
                                listbox: 'mui-listbox2',
                                popper: 'mui-listbox2',
                                input: 'mui-input',
                            }}
                            renderInput={(params) => <TextField {...params} />}
                            onChange={(_e, value) =>
                                setPerson({
                                    ...person,
                                    preferredStore: (value as IPreferredStore).label,
                                    preferredStoreCode: (value as IPreferredStore).id,
                                })
                            }
                        />
                    </div>
                </div>
                <div className="mt-2 sm:mt-0 sm:w-1/3">
                    <label className="text-[14px] sm:text-[17px] text-gray-600">
                        {translate(languageCode, 'personalDetails.dateOfBirth')}:
                        <span className="text-orange-700">*</span>
                    </label>
                    <div className="flex mt-2">
                        <div className="w-1/4">
                            <NumberSelect
                                value={person.dateOfBirth.day}
                                options={Array.from({ length: 31 }, (_, i) => `${i + 1}`)}
                                label={translate(languageCode, 'personalDetails.dateOfBirthDay')}
                                disabled={countriesOfResidence && !person.countryOfResidence}
                                error={error}
                                onChange={(value) => {
                                    setPerson({
                                        ...person,
                                        dateOfBirth: {
                                            ...person.dateOfBirth,
                                            day: Number(value) < 10 ? "0" + value : value ?? '',
                                        },
                                    })
                                }}
                            />
                        </div>
                        <div className="w-1/4">
                            <NumberSelect
                                value={person.dateOfBirth.month}
                                options={Array.from({ length: 12 }, (_, i) => `${i + 1}`)}
                                label={translate(languageCode, 'personalDetails.dateOfBirthMonth')}
                                disabled={countriesOfResidence && !person.countryOfResidence}
                                error={error}
                                onChange={(value) => {
                                    setPerson({
                                        ...person,
                                        dateOfBirth: {
                                            ...person.dateOfBirth,
                                            month: Number(value) < 10 ? "0" + value : value ?? '',
                                        },
                                    })
                                }}
                            />
                        </div>
                        <div className="w-1/2">
                            <NumberSelect
                                value={person.dateOfBirth.year}
                                options={Array.from({ length: 2006 - 1914 + 1 }, (_, i) => `${1914 + i}`).reverse()}
                                label={translate(languageCode, 'personalDetails.dateOfBirthYear')}
                                disabled={countriesOfResidence && !person.countryOfResidence}
                                error={error}
                                onChange={(value) => {
                                    setPerson({
                                        ...person,
                                        dateOfBirth: {
                                            ...person.dateOfBirth,
                                            year: value ?? '',
                                        },
                                    })
                                }}
                            />
                        </div>
                    </div>
                </div>
                <div className="mt-2 sm:mt-0 sm:w-1/3">
                    <Input
                        id="person-discount-code"
                        label={translate(languageCode, 'personalDetails.discountCode')}
                        disabled={countriesOfResidence && !person.countryOfResidence}
                        error={discountError}
                        onChange={(discountCode) => setPerson({ ...person, discountCode })}
                    />
                </div>
            </div>
            <div className="mt-6">
                <div className="flex form-check">
                    <input
                        className={`form-check-input appearance-none h-[20px] min-w-[20px] sm:h-[30px] sm:min-w-[30px] border rounded-sm
                            bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200
                            mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer ${
                                error && !person.rules
                                    ? 'border-red-700 border-2'
                                    : 'border-gray-300 hover:border-black'
                            }`}
                        type="checkbox"
                        checked={person.rules}
                        onChange={(event) => setPerson({ ...person, rules: event.target.checked })}
                        id="person-rules"
                    />
                    <label
                        className="form-check-label text-gray-600 inline-block text-[12px] sm:text-[17px] leading-[20px] sm:leading-[30px] mt-1"
                        htmlFor="person-rules"
                    >
                        {translate(languageCode, 'updateCard.personalDetails.consentToDataProcessingOne')}{' '}
                        <a
                            href={
                                region === CountryCode.Switzerland
                                    ? '/regolamento-fidelity-svizzera-risparmio-casa.pdf'
                                    : region === CountryCode.Malta
                                        ? '/regulation-loyalty-card.pdf'
                                        : '/93082244-regolamento-carta-risparmio-insieme-2022.pdf'
                            }
                            target="_blank"
                            className="text-blue-600 hover:underline hover:cursor-pointer"
                            rel="noreferrer"
                        >
                            {translate(languageCode, 'updateCard.personalDetails.consentToDataProcessingTwo')}
                        </a>
                        <span className="text-orange-700">*</span>
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
                        checked={person.marketing}
                        onChange={(event) =>
                            setPerson({ ...person, marketing: event.target.checked })
                        }
                        id="person-marketing-confirmation"
                    />
                    <label
                        className="form-check-label text-gray-600 inline-block text-[12px] sm:text-[17px] leading-[20px] sm:leading-[30px] mt-1"
                        htmlFor="person-marketing-confirmation"
                    >
                        {translate(languageCode, 'updateCard.personalDetails.consentToMarketingOne')}{' '}
                        {(brand === 'rica') && (<a
                            href={
                                region === CountryCode.Switzerland
                                    ? '/regolamento-2025-CH.pdf'
                                    : region === CountryCode.Malta
                                    ? '/regolamento-2025-MT.pdf'
                                    : '/regolamento-2025-IT.pdf'
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline hover:cursor-pointer"
                        >
                            {translate(languageCode, 'updateCard.personalDetails.consentToMarketingTwo')}
                        </a>)}
                        {(brand === 'uniprice') && (<a
                            href="/regolamento-2025-IT-uniprice.pdf"
                            target="_blank"
                            className="text-blue-600 hover:underline hover:cursor-pointer"
                            rel="noreferrer"
                        >
                            {translate(languageCode, 'personalDetails.consentToMarketingTwo')}
                        </a>)}{' '}
                        ({translate(languageCode, 'updateCard.personalDetails.consentToMarketingThree')})
                        <div className="italic font-bold text-blue-600">
                            ({translate(languageCode, 'updateCard.personalDetails.consentDiscountOne')}{' '}
                            <span className="bg-yellow-200">
                                {translate(languageCode, 'updateCard.personalDetails.consentDiscountTwo')}
                            </span>)
                        </div>
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
                        checked={person.statistics}
                        onChange={(event) =>
                            setPerson({ ...person, statistics: event.target.checked })
                        }
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
                            rel="noreferrer"
                            className="text-blue-600 hover:underline hover:cursor-pointer"
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
            <div className="text-center">
                <button
                    className={`mx-auto mt-5 sm:mt-10 bg-brand-primary rounded-3xl p-2 px-10 ${
                        loading ? 'opacity-80 cursor-not-allowed' : ''
                    }`}
                    onClick={() => {
                        if (!loading) verifyPersonData();
                    }}
                >
                    <span className="text-[12px] sm:text-[18px] font-bold text-white">
                          {translate(languageCode, 'common.proceed')}
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
                            {translate(languageCode, 'common.loadingInProgress')}...
                        </p>
                    </div>
                </div>
            )}
            <div className="w-full mt-5 sm:mt-10">
                <p className="text-xs text-orange-700 sm:text-sm">*{translate(languageCode, 'common.requiredFields')}
                </p>
            </div>
        </div>
    );
};
export default withRouter(CardUpdateWizardItem);
