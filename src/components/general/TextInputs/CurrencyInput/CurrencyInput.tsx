import React, { FunctionComponent, SetStateAction, useCallback } from 'react';

import { escapeRegExp } from '@src/lib';
import TextInput, { TextInputProps } from '@src/components/general/TextInputs/TextInput/TextInput';

interface Props extends TextInputProps {
    prependSymbol?: string | undefined;
    setValue: React.Dispatch<SetStateAction<string>>;
}

const inputRegex = RegExp(`^\\d*(?:\\\\[.])?\\d*$`); // match escaped "." characters via in a non-capturing group

const CurrencyInput: FunctionComponent<Props> = ({ value, setValue, ...props }) => {
    const enforcer = useCallback((value: string) => {
        const nextUserInput = value.replace(/,/g, '.');
        if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
            setValue(nextUserInput);
        }
    }, []);

    return (
        <TextInput
            pattern="^[0-9]*[.,]?[0-9]*$"
            placeholder="0.0"
            inputMode="decimal"
            type="text"
            value={value}
            setValue={enforcer}
            {...props}
        />
    );
};

export default React.memo(CurrencyInput);
