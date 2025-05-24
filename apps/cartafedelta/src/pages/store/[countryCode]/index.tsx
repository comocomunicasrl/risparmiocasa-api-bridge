import { InferGetServerSidePropsType, NextPage } from 'next';
import { useState } from 'react';
import BasicLayout from '../../../components/BasicLayout';
import NavigationStepHeader from '../../../components/NavigationStepHeader';
import { StoreActivateCardStep } from '../../../core/models/enums/StoreActivateCardStep';
import OTPAuth from '../../../components/OTPAuth';
import { IPersonDetails } from '../../../core/models/IPersonDetails';
import PersonDetails from '../../../components/PersonDetails';
import { RisparmioCasaRepository } from '../../../core/repositories/RisparmioCasaRepository';
import { serializePreferredStores, translate } from '../../../utils/utils';
import { CountryCode, CountryOfResidence } from '../../../core/models/enums/Country';
import citiesIt from '../../../core/data/cities.json';
import citiesCh from '../../../core/data/cities_ch.json';
import citiesMt from '../../../core/data/cities_mt.json';
import CardNumber from '../../../components/CardNumber';

export async function getServerSideProps(context) {
    const risparmioCasaRepository = new RisparmioCasaRepository();
    const preferredStores = serializePreferredStores(
        await risparmioCasaRepository.getPreferredStores()
    );
    return { 
        props: { 
            countryCode: context.query.countryCode,
            preferredStores
        } 
    };
}

const Page: NextPage = ({
    countryCode,
    preferredStores
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
    const [cities] = useState({ 
        [CountryCode.Italy]: citiesIt,
        [CountryCode.Switzerland]: citiesCh,
        [CountryCode.Malta]: citiesMt 
    });
    const [currentStep, setCurrentStep] = useState(StoreActivateCardStep.OTPAuth);
    const [details, setDetails] = useState<IPersonDetails>({});
    const languageCode = (countryCode === 'mt') ? 'en' : 'it';

    const onOTPConfirmed = (personDetails: IPersonDetails) => {
        setDetails({
            ...personDetails,
            preferredStore: '0000EC',
            preferredStoreCode: '0000EC',
            countryOfResidence: countryCode,
            registrationCountry: countryCode
        });
        setCurrentStep(StoreActivateCardStep.PersonalData);
    };

    const cancelActual = () => {
        setDetails({});
        setCurrentStep(StoreActivateCardStep.OTPAuth);
    }

    return (
        <>
            <BasicLayout paragraphTitle={translate(languageCode, 'storePage.fidelityCardSubscription')}>
                <div className="flex flex-col border border-t-0 shadow min-h-[500px]">
                    <div className="flex flex-col grow p-4 border-t-4 sm:p-5 border-risparmiocasa-dark-blue overflow-hidden">
                        <div className="hidden xl:flex w-full mx-auto text-center ">
                            <NavigationStepHeader
                                title={`1 - ${translate(languageCode, 'storePage.OTPAuth')}`}
                                active={currentStep === StoreActivateCardStep.OTPAuth}
                            />
                            <NavigationStepHeader
                                title={`2 - ${translate(languageCode, 'storePage.personalData')}`}
                                active={currentStep === StoreActivateCardStep.PersonalData}
                            />
                            <NavigationStepHeader
                                title={`3 - ${translate(languageCode, 'storePage.cardAssociation')}`}
                                active={currentStep === StoreActivateCardStep.CardAssociation}
                            />
                            <NavigationStepHeader
                                title={`4 - ${translate(languageCode, 'storePage.cardIssuing')}`}
                                active={currentStep === StoreActivateCardStep.CardEmission}
                            />
                        </div>
                        {currentStep === StoreActivateCardStep.OTPAuth && (
                            <div className="grow mt-8">
                                <OTPAuth countryCode={countryCode} onSuccess={onOTPConfirmed} />
                            </div>
                            
                        )}
                        {currentStep === StoreActivateCardStep.PersonalData && (
                            <div className="grow mt-8">
                                <PersonDetails
                                    countryCode={countryCode}
                                    personDetails={details}
                                    preferredStores={preferredStores}
                                    cities={cities}
                                    region={countryCode}
                                    storeVersion={true}
                                    countriesOfResidence={(countryCode === 'ch') ? [
                                        {
                                            code: CountryCode.Italy,
                                            label: CountryOfResidence.Italy,
                                        },
                                        {
                                            code: CountryCode.Switzerland,
                                            label: CountryOfResidence.Switzerland,
                                        },
                                    ] : null}
                                    onSuccess={(data) => {
                                        setDetails(data);
                                        setCurrentStep(StoreActivateCardStep.CardAssociation);
                                    }}
                                    onCancel={() => cancelActual()}
                                />
                            </div>
                            
                        )}
                        {currentStep === StoreActivateCardStep.CardAssociation && (
                            <div className="grow mt-8">
                                <CardNumber 
                                    personDetails={details} 
                                    countryCode={countryCode}
                                    onSuccess={(data) => {
                                        setDetails(data);
                                        setCurrentStep(StoreActivateCardStep.CardEmission);
                                    }}
                                    onCancel={() => cancelActual()}
                                ></CardNumber>
                            </div>
                        )}
                        {currentStep === StoreActivateCardStep.CardEmission && (
                            <div className='grow'>
                                <div className="mt-8 flex flex-col text-center">
                                    <span className='text-5xl text-blue-500 mb-8 font-extrabold'>{translate(languageCode, 'storePage.cardAssociationEnd')}</span>
                                    <span className='text-gray-600 text-[14px] sm:text-[17px]'>{translate(languageCode, 'storePage.cardCreated')}</span>
                                    <span className='text-gray-600 text-[14px] sm:text-[17px]'>{translate(languageCode, 'storePage.notReceivedCard')}</span>
                                </div>
                                <div className="text-center">
                                    <button
                                        className='mx-auto mt-5 sm:mt-10 bg-risparmiocasa-blue rounded-3xl p-2 px-10'
                                        onClick={() => {
                                            window.location.reload()
                                        }}
                                    >
                                        <span className="text-[12px] sm:text-[18px] font-bold text-white">
                                            {translate(languageCode, 'storePage.addNewCard')?.toUpperCase()}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </BasicLayout>
        </>
    );
};

export default Page;
