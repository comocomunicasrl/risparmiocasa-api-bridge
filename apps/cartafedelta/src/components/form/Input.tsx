import React, { HTMLProps } from 'react';

interface IInputProps {
    id: string;
    label: string;
    error?: boolean;
    errorText?: string
    required?: boolean;
    onChange?: (data: string) => void;
}

const Input = ({ id, label, error, errorText, required, onChange, ...rest }: IInputProps & HTMLProps<any>) => {
    const [value, setValue] = React.useState('');

    return (
        <div>
            <label htmlFor={id} className="text-[14px] sm:text-[17px] text-gray-600">
                {label}:{required && <span className="text-orange-700">*</span>}
            </label>
            <div className="w-full">
                <input
                    id={id}
                    type="text"
                    className={`rounded h-[40px] w-full sm:w-[90%] mt-2 px-4 text-gray-600 outline-blue-600 ${
                        error
                            ? 'border-red-700 border-2'
                            : 'border-risparmiocasa-neutral hover:border-black border'
                    }`}
                    onChange={(event) => {
                        setValue(event.target.value);
                        onChange && onChange(event.target.value);
                    }}
                    value={value}
                    {...rest}
                />
                <span className="block font-medium tracking-wide text-red-500 text-xs mt-1 mx-auto w-full sm:w-[90%] text-left">
                    {errorText ?? '\u00A0'}
                </span>
            </div>
        </div>
    );
};
export default Input;
