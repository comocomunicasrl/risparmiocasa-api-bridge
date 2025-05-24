import React from 'react';
import {TranslationLanguageCode} from "../../core/models/enums/Translation";
import {translate} from "../../utils/utils";

interface IConfirmationWizardItemProps {
    languageCode?: TranslationLanguageCode;
}


const ConfirmationWizardItem = ({
    languageCode = TranslationLanguageCode.It
}: IConfirmationWizardItemProps) => {
    return (
        <div className="w-full mx-auto mt-4 sm:mt-14">
            <div className="text-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-[18px] sm:w-[24px] float-left ml-4"
                    viewBox="0 0 512 512"
                >
                    <path
                        fill="white"
                        d="M480 352h-133.5l-45.25 45.25C289.2 409.3 273.1 416 256 416s-33.16-6.656-45.25-18.75L165.5 352H32c-17.67 0-32 14.33-32 32v96c0 17.67 14.33 32 32 32h448c17.67 0 32-14.33 32-32v-96C512 366.3 497.7 352 480 352zM432 456c-13.2 0-24-10.8-24-24c0-13.2 10.8-24 24-24s24 10.8 24 24C456 445.2 445.2 456 432 456zM233.4 374.6C239.6 380.9 247.8 384 256 384s16.38-3.125 22.62-9.375l128-128c12.49-12.5 12.49-32.75 0-45.25c-12.5-12.5-32.76-12.5-45.25 0L288 274.8V32c0-17.67-14.33-32-32-32C238.3 0 224 14.33 224 32v242.8L150.6 201.4c-12.49-12.5-32.75-12.5-45.25 0c-12.49 12.5-12.49 32.75 0 45.25L233.4 374.6z"
                    />
                </svg>
            </div>

            <div className="flex justify-center my-12">
                <div className="grid">
                <svg xmlns="http://www.w3.org/2000/svg" width="393" height="194">
                    <defs>
                        <clipPath id="clip-path">
                            <path
                                fill="none"
                                d="M0 0H137.541V147.484H0z"
                                data-name="Rettangolo 35"
                            ></path>
                        </clipPath>
                    </defs>
                    <g data-name="Raggruppa 8" transform="translate(-524 -317)">
                        <g data-name="Raggruppa 6" transform="translate(651.229 317)">
                            <g clipPath="url(#clip-path)" data-name="Raggruppa 5">
                                <path
                                    fill="#f9c0c0"
                                    d="M217.942 155.73h-33.785l4.665-37.322a7.841 7.841 0 00-15.029-3.963l-17.975 43.567a12.822 12.822 0 01-12.031 8.387h-8.65v50.461h11.473a14.769 14.769 0 0110.442 4.325 14.769 14.769 0 0010.442 4.325h38.726a11.533 11.533 0 0010.767-7.4l15.714-40.9a15.81 15.81 0 00-14.759-21.479"
                                    data-name="Tracciato 3"
                                    transform="translate(-96.211 -78.026)"
                                ></path>
                                <path
                                    fill="#0c61c6"
                                    d="M0 0H47.577V59.111H0z"
                                    data-name="Rettangolo 28"
                                    transform="translate(0 88.373)"
                                ></path>
                                <path
                                    d="M76.6 417.67a5.767 5.767 0 10-5.767 5.767 5.773 5.773 0 005.767-5.767"
                                    data-name="Tracciato 4"
                                    transform="translate(-46.325 -293.254)"
                                ></path>
                                <path
                                    fill="#ccefff"
                                    d="M0 0H8.65V15.858H0z"
                                    data-name="Rettangolo 29"
                                    transform="rotate(-9.998 45.18 -417.604)"
                                ></path>
                                <path
                                    fill="#ace3fc"
                                    d="M0 0H15.858V8.65H0z"
                                    data-name="Rettangolo 30"
                                    transform="rotate(-54.97 64.726 -82.295)"
                                ></path>
                                <path
                                    fill="#ace3fc"
                                    d="M0 0H15.858V8.65H0z"
                                    data-name="Rettangolo 31"
                                    transform="rotate(-9.998 236.762 -600.485)"
                                ></path>
                                <path
                                    fill="#ace3fc"
                                    d="M0 0H8.65V15.858H0z"
                                    data-name="Rettangolo 32"
                                    transform="rotate(-54.97 106.858 -69.034)"
                                ></path>
                                <path
                                    fill="#ccefff"
                                    d="M0 0H15.858V8.65H0z"
                                    data-name="Rettangolo 33"
                                    transform="rotate(-9.997 269.265 -229.628)"
                                ></path>
                                <path
                                    fill="#ccefff"
                                    d="M0 0H8.651V15.861H0z"
                                    data-name="Rettangolo 34"
                                    transform="rotate(-55 44.527 -36.531)"
                                ></path>
                                <path
                                    fill="#dcf4ff"
                                    d="M76.6 417.67a5.767 5.767 0 10-5.767 5.767 5.773 5.773 0 005.767-5.767"
                                    data-name="Tracciato 5"
                                    transform="translate(-46.325 -293.254)"
                                ></path>
                                <path
                                    fill="#fcacab"
                                    d="M339.1 269.758h-33.789v69.78h22.063a11.534 11.534 0 0010.767-7.4l15.714-40.9a15.81 15.81 0 00-14.758-21.48"
                                    data-name="Tracciato 6"
                                    transform="translate(-217.366 -192.054)"
                                ></path>
                            </g>
                        </g>
                    </g>
                </svg>
                    <p className="text-center text-7xl font-bold text-[#3d90df]">
                        {translate(languageCode, 'updateCard.confirmation.thanks')}
                    </p>
                </div>
            </div>

            <div className="mb-40 text-center">
                <p className="sm:text-xl">
                    {translate(languageCode, 'updateCard.confirmation.confirmationTextOne')}
                </p>
                <p className="sm:text-xl">
                    {translate(languageCode, 'updateCard.confirmation.confirmationTextTwo')}
                </p>
                <p className="underline sm:text-xl">
                    {translate(languageCode, 'updateCard.confirmation.confirmationTextThree')}
                </p>
            </div>
        </div>
    );
};
export default ConfirmationWizardItem;
