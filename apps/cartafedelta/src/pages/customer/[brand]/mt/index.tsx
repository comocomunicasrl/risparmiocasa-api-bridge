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
import citiesMt from '@/core/data/cities_mt.json';
import { ICity } from '@/core/models/ICity';
import axios from 'axios';
import { EmailProvider } from '@/core/models/EmailProvider';
import { CountryCode } from '@/core/models/enums/Country';
import Footer from '@/components/Footer';

export async function getServerSideProps() {
    const risparmioCasaRepository = new RisparmioCasaRepository('rica');
    const currentTime = new Date().getTime();
    const friendPromo = (currentTime >= 1753826400000) && (currentTime < 1753912800000);
    const preferredStores = await risparmioCasaRepository.getPreferredStores(CountryCode.Malta);

    return {
        props: {
            preferredStores,
            cities: {
                [CountryCode.Malta]: citiesMt,
            },
            friendPromo
        },
    };
}

interface IProps {
    preferredStores: IPreferredStore[];
    cities: { [key: string]: ICity[] };
    friendPromo: boolean;
}

const RegistrationMalta: NextPage = ({ preferredStores, cities, friendPromo }: PropsWithChildren<IProps>) => {
    const [currentStep, setCurrentStep] = React.useState(CreateCardStep.PersonDetails);
    const [details, setDetails] = React.useState<IPersonDetails>();
    const [cardNumber, setCardNumber] = React.useState('');

    const createCard = (email: string, provider: EmailProvider) => {
        details.email = email;
        details.registrationCountry = CountryCode.Malta;

        axios
            .post('/api/create-card', { details, provider, brand: 'rica' })
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
            <div className="brand-rica">
                <header className="h-[110px] bg-risparmiocasa-blue border-b border-gray-500">
                    <img src="/logo.png" alt="Risparmiocasa logo" className="mx-auto" />
                </header>
                <div className="container mx-auto">
                    <div className="mx-auto mt-5 mb-5">
                        <h1 className="text-[16px] sm:text-[24px] font-bold text-center">
                            New loyalty card request form
                        </h1>
                    </div>
                    <div className="border border-t-0 shadow min-h-[220px]">
                        <div className="h-full p-4 border-t-4 sm:p-5 border-risparmiocasa-dark-blue">
                            <div className="flex w-full mx-auto text-center">
                                <NavigationStepHeader
                                    title="1 - Personal data"
                                    active={currentStep === CreateCardStep.PersonDetails}
                                />
                                <NavigationStepHeader
                                    title="2 - Confirm email"
                                    active={currentStep === CreateCardStep.EmailConfirmation}
                                />
                                <NavigationStepHeader
                                    title="3 - Card issuing"
                                    active={currentStep === CreateCardStep.CardConfirmation}
                                />
                            </div>
                            {currentStep === CreateCardStep.PersonDetails && (
                                <PersonDetails
                                    brand="rica"
                                    countryCode="mt"
                                    preferredStores={preferredStores}
                                    cities={cities}
                                    friendPromo={friendPromo}
                                    onSuccess={(data) => {
                                        setDetails(data);
                                        setCurrentStep(CreateCardStep.EmailConfirmation);
                                    }}
                                    region={CountryCode.Malta}
                                />
                            )}
                            {currentStep === CreateCardStep.EmailConfirmation && (
                                <EmailConfirmation
                                    brand="rica"
                                    details={details}
                                    onSuccess={createCard}
                                    countryCode={CountryCode.Malta}
                                />
                            )}
                            {currentStep === CreateCardStep.CardConfirmation && (
                                <CardConfirmation cardNumber={cardNumber} />
                            )}
                        </div>
                    </div>
                    <Footer />
                </div>
            </div>
        </>
    );
};

export default RegistrationMalta;
