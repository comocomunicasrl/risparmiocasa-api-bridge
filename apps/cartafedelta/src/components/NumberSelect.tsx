import React, {useState} from 'react';
import {Autocomplete, TextField} from "@mui/material";

type NumberSelectProps = {
    label: string;
    value: string | null;
    options: string[];
    onChange: (value: string | null) => void;
    disabled?: boolean;
    error?: boolean;
}

const NumberSelect = ({
    label,
    value,
    options,
    onChange,
    disabled = false,
    error = false,
}: NumberSelectProps) => {
    const [isFocused, setIsFocused] = useState(false);

        return (
            <Autocomplete
                disabled={disabled}
                size={'small'}
                disableListWrap
                disableClearable={true}
                classes={{
                    root: `sm:w-[90%] ${error ? 'error' : ''}`,
                    listbox: 'mui-listbox',
                    popper: 'mui-listbox',
                    input: 'mui-input',
                }}
                value={value}
                options={options}
                onChange={(_e, value) => onChange(value)}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        fullWidth
                        label={isFocused || value ? '' : label}
                        error={error}
                        InputProps={{
                            ...params.InputProps,
                            onFocus: () => setIsFocused(true),
                            onBlur: () => setIsFocused(false),
                        }}
                        InputLabelProps={{
                            shrink: false,
                        }}
                    />
                )}
            />
        );
};

export default NumberSelect;