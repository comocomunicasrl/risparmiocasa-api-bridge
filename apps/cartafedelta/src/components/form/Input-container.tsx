import { ReactNode } from "react";

type Props = {
    label?: string,
    inputId: string,
    required: boolean,
    errorText?: string,
    children: ReactNode
}

const InputContainer = ({ label, inputId, required, errorText, children }: Props) => {
    return (
        <>
            {label && (<label htmlFor={inputId} className="text-[14px] sm:text-[17px] text-gray-600 mx-auto w-full text-left">
                {label}:{required && <span className="text-orange-700">*</span>}
            </label>)}
            <div className="w-full">
                {children}
                <span className="block font-medium tracking-wide text-red-500 text-xs mt-1 mx-auto w-full text-left">
                    {errorText ?? '\u00A0'}
                </span>
            </div>
        </>
    );
};
export default InputContainer;