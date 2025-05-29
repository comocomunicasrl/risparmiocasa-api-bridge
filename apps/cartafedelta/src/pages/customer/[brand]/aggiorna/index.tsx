import { RisparmioCasaRepository } from '../../../../core/repositories/RisparmioCasaRepository';
import cities from '@/core/data/cities.json';
import dialCodes from '@/core/data/dialCodes.json';
import { IPreferredStore } from '@/core/models/IPreferredStore';
import { ICity } from '@/core/models/ICity';
import { NextPage } from 'next';
import React, { PropsWithChildren } from 'react';
import Head from 'next/head';
import NavigationStepHeader from '@/components/NavigationStepHeader';
import { UpdateCardStep } from '@/core/models/enums/UpdateCardStep';
import { IPersonDetails } from '@/core/models/IPersonDetails';
import { IVerifiedCardData } from '@/core/models/IVerifiedCardData';
import VerificationWizardItem from '@/components/data-update-wizard/VerificationWizardItem';
import { serializePreferredStores } from '@/utils/utils';
import CardUpdateWizardItem from '@/components/data-update-wizard/CardUpdateWizardItem';
import ConfirmEmailWizardItem from '@/components/data-update-wizard/ConfirmEmailWizardItem';
import ConfirmationWizardItem from '@/components/data-update-wizard/ConfirmationWizardItem';
import axios from 'axios';
import { EmailProvider } from '@/core/models/EmailProvider';
import {CountryCode} from "@/core/models/enums/Country";
import resources from '../index.resources.json';
import globalLocales from '@/dictionaries/global.locales.json';
import Footer from '@/components/Footer';

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
        props: { brand, preferredStores, cities: { [CountryCode.Italy]: cities }, dialCodes, globalLocales, resources },
    };
}

interface IProps {
    brand: string;
    preferredStores: IPreferredStore[];
    cities: { [key: string]: ICity[] };
    globalLocales: Record<string, Record<string, string>>;
    resources: Record<string, Record<string, string>>;
}

const CardUpdate: NextPage = ({ brand, preferredStores, cities, globalLocales, resources }: PropsWithChildren<IProps>) => {
    const [currentStep, setCurrentStep] = React.useState(UpdateCardStep.CardCheck);
    const [verifiedData, setVerifiedData] = React.useState<IVerifiedCardData>();
    const [details, setDetails] = React.useState<IPersonDetails>();

    const updateCard = (email: string, provider: EmailProvider) => {
        axios
            .post('/api/update-card-confirm', {
                details: {
                    ...details,
                    registrationCountry: CountryCode.Italy,
                    email,
                },
                provider,
                brand
            })
            .then((response) => {
                setCurrentStep(UpdateCardStep.Confirmation);
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
                            Modulo aggiornamento dati carta fedeltà
                        </h1>
                    </div>
                    <div className="border border-t-0 shadow min-h-[220px]">
                        <div className="h-full p-4 border-t-4 sm:p-5 border-brand-dark-primary">
                            <div className="flex w-full mx-auto text-center">
                                <NavigationStepHeader
                                    title="1 - Carta fedeltà"
                                    active={currentStep === UpdateCardStep.CardCheck}
                                />
                                <NavigationStepHeader
                                    title="2 - Dati anagrafici"
                                    active={currentStep === UpdateCardStep.PersonDetails}
                                />
                                <NavigationStepHeader
                                    title="3 - Conferma email"
                                    active={currentStep === UpdateCardStep.EmailConfirmation}
                                />
                                <NavigationStepHeader
                                    title="4 - Conferma"
                                    active={currentStep === UpdateCardStep.Confirmation}
                                />
                            </div>
                            {currentStep === UpdateCardStep.CardCheck && (
                                <VerificationWizardItem
                                    brand={brand}
                                    checkIfCardAlreadyUpdated={false}
                                    dialCodes={dialCodes}
                                    onSuccess={(verifiedData) => {
                                        setVerifiedData(verifiedData);
                                        setCurrentStep(UpdateCardStep.PersonDetails);
                                    }}
                                />
                            )}
                            {currentStep === UpdateCardStep.PersonDetails && (
                                <CardUpdateWizardItem
                                    brand={brand}
                                    preferredStores={preferredStores}
                                    cities={cities}
                                    verifiedCardData={verifiedData}
                                    onSuccess={(data) => {
                                        setDetails(data);
                                        setCurrentStep(UpdateCardStep.EmailConfirmation);
                                    }}
                                />
                            )}
                            {currentStep === UpdateCardStep.EmailConfirmation && (
                                <ConfirmEmailWizardItem
                                    brand={brand}
                                    details={details}
                                    onSuccess={(email, provider) => updateCard(email, provider)}
                                />
                            )}
                            {currentStep === UpdateCardStep.Confirmation && <ConfirmationWizardItem />}
                        </div>
                    </div>
                    <Footer brand={brand} />
                </div>
            </div>
        </>
    );
};

export default CardUpdate;
