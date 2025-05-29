import type { NextPage } from 'next';
import React, { PropsWithChildren } from 'react';
import PersonDetails from '@/components/PersonDetails';
import NavigationStepHeader from '@/components/NavigationStepHeader';
import { CreateCardStep } from '@/core/models/enums/CreateCardStep';
import EmailConfirmation from '@/components/EmailConfirmation';
import { IPersonDetails } from '@/core/models/IPersonDetails';
import CardConfirmation from '@/components/CardConfirmation';
import Head from 'next/head';
import { RisparmioCasaRepository } from '@/core/repositories/RisparmioCasaRepository';
import { IPreferredStore } from '@/core/models/IPreferredStore';
import cities from '@/core/data/cities.json';
import { ICity } from '@/core/models/ICity';
import axios from 'axios';
import { EmailProvider } from '@/core/models/EmailProvider';
import { CountryCode } from '@/core/models/enums/Country';
import { serializePreferredStores } from '@/utils/utils';
import Footer from '@/components/Footer';
import locales from './index.locales.json';
import resources from './index.resources.json';
import globalLocales from '@/dictionaries/global.locales.json';

export async function getServerSideProps(context) {
    const brand = context.query.brand;
    let preferredStores: IPreferredStore[];

    if (brand === 'rica') {
        const risparmioCasaRepository = new RisparmioCasaRepository(brand);
        preferredStores = serializePreferredStores(
            await risparmioCasaRepository.getPreferredStores()
        );
    } else {
        preferredStores = [{ id: '0000AE', label: 'Pinerolo' }];
    }

    return {
        props: { 
            brand,
            preferredStores, 
            cities: { [CountryCode.Italy]: cities } ,
            locales,
            globalLocales,
            resources
        }
    };
}

interface IProps {
    brand: string;
    preferredStores: IPreferredStore[];
    cities: { [key: string]: ICity[] };
    locales: Record<string, Record<string, string>>;
    globalLocales: Record<string, Record<string, string>>;
    resources: Record<string, Record<string, string>>;
}

const Home: NextPage = ({ brand, preferredStores, cities, locales, globalLocales, resources }: PropsWithChildren<IProps>) => {
    const [currentStep, setCurrentStep] = React.useState(CreateCardStep.PersonDetails);
    const [details, setDetails] = React.useState<IPersonDetails>();
    const [cardNumber, setCardNumber] = React.useState('');

    const createCard = (email: string, provider: EmailProvider) => {
        details.email = email;
        details.registrationCountry = CountryCode.Italy;

        axios
            .post('/api/create-card', { details, provider, brand })
            .then((response) => {
                setCardNumber(response.data.cardNumber);
                setCurrentStep(CreateCardStep.CardConfirmation);
            })
            .catch(() => {
                window.alert('Sorry. Could not perform request.');
                window.location.reload();
            });
    };

    return (
        <>
            <Head>
                <title>{globalLocales[brand]?.basicWindowTitle}</title>
                <link rel="icon" href={resources[brand].favicon} />
            </Head>
            <div className={`brand-${brand}`}>
                <header className="h-[110px] bg-brand-primary border-b border-gray-500">
                    <img src={resources[brand].logo} alt={`${globalLocales[brand].brandName} logo`} className="mx-auto min-h-[107px]" />
                </header>
                <div className="container mx-auto">
                    <div className="mx-auto mt-5 mb-5">
                        <h1 className="text-[16px] sm:text-[24px] font-bold text-center">
                            Modulo richiesta nuova carta fedeltà
                        </h1>
                    </div>
                    <div className="border border-t-0 shadow min-h-[220px]">
                        <div className="h-full p-4 border-t-4 sm:p-5 border-dark-primary">
                            <div className="flex w-full mx-auto text-center">
                                <NavigationStepHeader
                                    title="1 - Dati anagrafici"
                                    active={currentStep === CreateCardStep.PersonDetails}
                                />
                                <NavigationStepHeader
                                    title="2 - Conferma email"
                                    active={currentStep === CreateCardStep.EmailConfirmation}
                                />
                                <NavigationStepHeader
                                    title="3 - Emissione carta"
                                    active={currentStep === CreateCardStep.CardConfirmation}
                                />
                            </div>
                            {currentStep === CreateCardStep.PersonDetails && (
                                <PersonDetails
                                    brand={brand}
                                    countryCode="it"
                                    preferredStores={preferredStores}
                                    cities={cities}
                                    onSuccess={(data) => {
                                        setDetails(data);
                                        setCurrentStep(CreateCardStep.EmailConfirmation);
                                    }}
                                />
                            )}
                            {currentStep === CreateCardStep.EmailConfirmation && (
                                <EmailConfirmation
                                    brand={brand}
                                    details={details}
                                    onSuccess={createCard}
                                    countryCode={CountryCode.Italy}
                                />
                            )}
                            {currentStep === CreateCardStep.CardConfirmation && (
                                <CardConfirmation cardNumber={cardNumber} />
                            )}
                        </div>
                    </div>
                    <Footer brand={brand} />
                </div>
            </div>
        </>
    );
};

export default Home;
