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
import citiesCh from '@/core/data/cities_ch.json';
import { ICity } from '@/core/models/ICity';
import axios from 'axios';
import { EmailProvider } from '@/core/models/EmailProvider';
import { CountryCode, CountryOfResidence } from '@/core/models/enums/Country';
import Footer from '@/components/Footer';

export async function getServerSideProps() {
    const risparmioCasaRepository = new RisparmioCasaRepository();
    const preferredStores = await risparmioCasaRepository.getPreferredStores(
        CountryCode.Switzerland
    );

    return {
        props: {
            preferredStores,
            cities: {
                [CountryCode.Italy]: cities,
                [CountryCode.Switzerland]: citiesCh,
            },
        },
    };
}

interface IProps {
    preferredStores: IPreferredStore[];
    cities: { [key: string]: ICity[] };
}

const Home: NextPage = ({ preferredStores, cities }: PropsWithChildren<IProps>) => {
    const [currentStep, setCurrentStep] = React.useState(CreateCardStep.PersonDetails);
    const [details, setDetails] = React.useState<IPersonDetails>();
    const [cardNumber, setCardNumber] = React.useState('');

    const createCard = (email: string, provider: EmailProvider) => {
        details.email = email;
        details.registrationCountry = CountryCode.Switzerland;

        axios
            .post('/api/create-card', { details, provider })
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
                <title>Risparmio Casa</title>
                <link rel="icon" href="/favicon.png" />
            </Head>
            <header className="h-[110px] bg-risparmiocasa-blue border-b border-gray-500">
                <img src="/logo.png" alt="Risparmiocasa logo" className="mx-auto" />
            </header>
            <div className="container mx-auto">
                <div className="mx-auto mt-5 mb-5">
                    <h1 className="text-[16px] sm:text-[24px] font-bold text-center">
                        Modulo richiesta nuova carta fedeltà
                    </h1>
                </div>
                <div className="border border-t-0 shadow min-h-[220px]">
                    <div className="h-full p-4 border-t-4 sm:p-5 border-risparmiocasa-dark-blue">
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
                                countryCode="ch"
                                preferredStores={preferredStores}
                                cities={cities}
                                countriesOfResidence={[
                                    {
                                        code: CountryCode.Italy,
                                        label: CountryOfResidence.Italy,
                                    },
                                    {
                                        code: CountryCode.Switzerland,
                                        label: CountryOfResidence.Switzerland,
                                    },
                                ]}
                                onSuccess={(data) => {
                                    setDetails(data);
                                    setCurrentStep(CreateCardStep.EmailConfirmation);
                                }}
                                region={CountryCode.Switzerland}
                            />
                        )}
                        {currentStep === CreateCardStep.EmailConfirmation && (
                            <EmailConfirmation
                                details={details}
                                onSuccess={createCard}
                                countryCode={CountryCode.Switzerland}
                            />
                        )}
                        {currentStep === CreateCardStep.CardConfirmation && (
                            <CardConfirmation cardNumber={cardNumber} />
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
};

export default Home;
