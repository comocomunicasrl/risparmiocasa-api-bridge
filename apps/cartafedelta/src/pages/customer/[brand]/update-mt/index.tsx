import {RisparmioCasaRepository} from '@/core/repositories/RisparmioCasaRepository';
import citiesMt from '@/core/data/cities_mt.json';
import dialCodes from '@/core/data/dialCodes.json';
import {IPreferredStore} from '@/core/models/IPreferredStore';
import {ICity} from '@/core/models/ICity';
import {NextPage} from 'next';
import React, {PropsWithChildren} from 'react';
import Head from 'next/head';
import NavigationStepHeader from '@/components/NavigationStepHeader';
import {UpdateCardStep} from '@/core/models/enums/UpdateCardStep';
import {IPersonDetails} from '@/core/models/IPersonDetails';
import {IVerifiedCardData} from '@/core/models/IVerifiedCardData';
import VerificationWizardItem from '@/components/data-update-wizard/VerificationWizardItem';
import {getCurrentYear, serializePreferredStores} from '@/utils/utils';
import CardUpdateWizardItem from '@/components/data-update-wizard/CardUpdateWizardItem';
import ConfirmEmailWizardItem from '@/components/data-update-wizard/ConfirmEmailWizardItem';
import ConfirmationWizardItem from '@/components/data-update-wizard/ConfirmationWizardItem';
import axios from 'axios';
import {EmailProvider} from '@/core/models/EmailProvider';
import {CountryCode} from "@/core/models/enums/Country";
import {TranslationLanguageCode} from "@/core/models/enums/Translation";

export async function getServerSideProps() {
    const risparmioCasaRepository = new RisparmioCasaRepository('rica');
    const preferredStores = serializePreferredStores(await risparmioCasaRepository.getPreferredStores(
        CountryCode.Malta
    ));

    return {
        props: {
            preferredStores,
            cities: {
                [CountryCode.Malta]: citiesMt,
            },
        },
    };
}

interface IProps {
    preferredStores: IPreferredStore[];
    cities: { [key: string]: ICity[] };
}

const CardUpdate: NextPage = ({ preferredStores, cities }: PropsWithChildren<IProps>) => {
    const [currentStep, setCurrentStep] = React.useState(UpdateCardStep.CardCheck);
    const [verifiedData, setVerifiedData] = React.useState<IVerifiedCardData>();
    const [details, setDetails] = React.useState<IPersonDetails>();

    const updateCard = (email: string, provider: EmailProvider) => {
        axios
            .post('/api/update-card-confirm', {
                details: {
                    ...details,
                    registrationCountry: CountryCode.Malta,
                    email,
                },
                provider,
                brand: 'rica'
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
                            Loyalty card update data form
                        </h1>
                    </div>
                    <div className="border border-t-0 shadow min-h-[220px]">
                        <div className="h-full p-4 border-t-4 sm:p-5 border-risparmiocasa-dark-blue">
                            <div className="flex w-full mx-auto text-center">
                                <NavigationStepHeader
                                    title="1 - Loyalty Card"
                                    active={currentStep === UpdateCardStep.CardCheck}
                                />
                                <NavigationStepHeader
                                    title="2 - Personal data"
                                    active={currentStep === UpdateCardStep.PersonDetails}
                                />
                                <NavigationStepHeader
                                    title="3 - Confirm email"
                                    active={currentStep === UpdateCardStep.EmailConfirmation}
                                />
                                <NavigationStepHeader
                                    title="4 - Confirm"
                                    active={currentStep === UpdateCardStep.Confirmation}
                                />
                            </div>
                            {currentStep === UpdateCardStep.CardCheck && (
                                <VerificationWizardItem
                                    brand="rica"
                                    checkIfCardAlreadyUpdated={false}
                                    languageCode={TranslationLanguageCode.En}
                                    region={CountryCode.Malta}
                                    dialCodes={dialCodes}
                                    onSuccess={(verifiedData) => {
                                        setVerifiedData(verifiedData);
                                        setCurrentStep(UpdateCardStep.PersonDetails);
                                    }}
                                />
                            )}
                            {currentStep === UpdateCardStep.PersonDetails && (
                                <CardUpdateWizardItem
                                    brand="rica"
                                    preferredStores={preferredStores}
                                    cities={cities}
                                    verifiedCardData={verifiedData}
                                    region={CountryCode.Malta}
                                    languageCode={TranslationLanguageCode.En}
                                    onSuccess={(data) => {
                                        setDetails(data);
                                        setCurrentStep(UpdateCardStep.EmailConfirmation);
                                    }}
                                />
                            )}
                            {currentStep === UpdateCardStep.EmailConfirmation && (
                                <ConfirmEmailWizardItem
                                    brand="rica"
                                    languageCode={TranslationLanguageCode.En}
                                    details={details}
                                    onSuccess={(email, provider) => updateCard(email, provider)}
                                />
                            )}
                            {currentStep === UpdateCardStep.Confirmation && <ConfirmationWizardItem languageCode={TranslationLanguageCode.En}/>}
                        </div>
                    </div>
                    <footer className="pb-6 mx-auto mt-6 text-center sm:mt-10">
                        <p className="text-xs text-black sm:text-sm">
                            © {getCurrentYear()} Risparmio Casa Invest Srl - P. IVA 04389071004
                        </p>
                    </footer>
                </div>
            </div>
        </>
    );
};

export default CardUpdate;
