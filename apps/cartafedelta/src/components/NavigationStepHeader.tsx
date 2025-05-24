import React from 'react';

interface INavigationStepHeaderProps {
    title: string;
    active: boolean;
}

const NavigationStepHeader = ({ title, active }: INavigationStepHeaderProps) => {
    return (
        <div
            className={`w-1/3 text-risparmiocasa-light-blue text-[11px] sm:text-[16px] lg:text-[24px] font-bold ${
                active ? 'opacity-100' : 'opacity-50'
            }`}
        >
            {title}
        </div>
    );
};
export default NavigationStepHeader;
