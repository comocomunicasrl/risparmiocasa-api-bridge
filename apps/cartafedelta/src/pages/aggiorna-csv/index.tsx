import { RisparmioCasaRepository } from '../../core/repositories/RisparmioCasaRepository';
import cities from '../../core/data/cities.json';
import dialCodes from '../../core/data/dialCodes.json';
import { IPreferredStore } from '../../core/models/IPreferredStore';
import { ICity } from '../../core/models/ICity';
import { NextPage } from 'next';
import React, { PropsWithChildren } from 'react';
import Head from 'next/head';
import NavigationStepHeader from '../../components/NavigationStepHeader';
import { UpdateCardStep } from '../../core/models/enums/UpdateCardStep';
import { IPersonDetails } from '../../core/models/IPersonDetails';
import PersonDetailsUpdateWizardItem from '../../components/data-update-wizard/csv/PersonDetailsUpdateWizardItem';
import UpdateConfirmationWizardItem from '../../components/data-update-wizard/csv/UpdateConfirmationWizardItem';
import { IVerifiedCardData } from '../../core/models/IVerifiedCardData';
import VerificationWizardItem from '../../components/data-update-wizard/VerificationWizardItem';
import axios from 'axios';
import {getCurrentYear} from "../../utils/utils";

export async function getServerSideProps() {
    const risparmioCasaRepository = new RisparmioCasaRepository();
    const preferredStores = await risparmioCasaRepository.getPreferredStores();

    return {
        props: { preferredStores, cities, dialCodes },
    };
}

interface IProps {
    preferredStores: IPreferredStore[];
    cities: ICity[];
}

const Update: NextPage = ({ preferredStores }: PropsWithChildren<IProps>) => {
    const [currentStep, setCurrentStep] = React.useState(UpdateCardStep.CardCheck);
    const [verifiedData, setVerifiedData] = React.useState<IVerifiedCardData>();

    const addUpdateRecord = (details: IPersonDetails) => {
        axios
            .post('/api/update-card', { details })
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
                <title>Risparmio Casa</title>
                <link rel="icon" href="/favicon.png" />
            </Head>
            <header className="h-[110px] bg-risparmiocasa-blue border-b border-gray-500">
                <img src="/logo.png" alt="Risparmiocasa logo" className="mx-auto" />
            </header>
            <div className="container mx-auto">
                <div className="mx-auto mt-5 mb-5">
                    <h1 className="text-[16px] sm:text-[24px] font-bold text-center">
                        Modulo aggiornamento dati carta fedeltà
                    </h1>
                </div>
                <div className="border border-t-0 shadow min-h-[220px]">
                    <div className="h-full p-4 border-t-4 sm:p-5 border-risparmiocasa-dark-blue">
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
                                title="3 - Conferma"
                                active={currentStep === UpdateCardStep.Confirmation}
                            />
                        </div>
                        {currentStep === UpdateCardStep.CardCheck && (
                            <VerificationWizardItem
                                dialCodes={dialCodes}
                                onSuccess={(verifiedData) => {
                                    setVerifiedData(verifiedData);
                                    setCurrentStep(UpdateCardStep.PersonDetails);
                                }}
                            />
                        )}
                        {currentStep === UpdateCardStep.PersonDetails && (
                            <PersonDetailsUpdateWizardItem
                                preferredStores={preferredStores}
                                cities={cities}
                                verifiedCardData={verifiedData}
                                onSuccess={addUpdateRecord}
                            />
                        )}
                        {currentStep === UpdateCardStep.Confirmation && (
                            <UpdateConfirmationWizardItem />
                        )}
                    </div>
                </div>
                <footer className="pb-6 mx-auto mt-6 text-center sm:mt-10">
                    <p className="text-xs text-black sm:text-sm">
                        © {getCurrentYear()} Risparmio Casa Invest Srl - P. IVA 04389071004
                    </p>
                </footer>
            </div>
        </>
    );
};

export default Update;
