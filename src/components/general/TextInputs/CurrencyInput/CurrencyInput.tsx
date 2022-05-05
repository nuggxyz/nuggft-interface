import React, { FunctionComponent, useCallback } from 'react';
import { SiEthereum } from 'react-icons/si';
import { IoLogoUsd } from 'react-icons/io5';

import lib, { escapeRegExp } from '@src/lib';
import TextInput, { TextInputProps } from '@src/components/general/TextInputs/TextInput/TextInput';
import { useUsdPair } from '@src/client/usd';
import { EthInt } from '@src/classes/Fraction';
import { ETH_ONE } from '@src/lib/conversion';
import usePrevious from '@src/hooks/usePrevious';

// interface Props extends TextInputProps {
//     // setValue: SetState<string>;
// }

const inputRegex = /^\d*(?:\\[.])?\d*$/; // match escaped "." characters via in a non-capturing group

const CurrencyInput: FunctionComponent<TextInputProps> = ({ value, setValue, ...props }) => {
    const enforcer = useCallback(
        (x: string) => {
            const nextUserInput = x.replace(/,/g, '.');
            if (nextUserInput === '' || inputRegex.test(escapeRegExp(nextUserInput))) {
                setValue(nextUserInput);
            }
        },
        [setValue],
    );

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

interface DualProps extends TextInputProps {
    currencyPref: 'ETH' | 'USD';
}

export const DualCurrencyInput: FunctionComponent<DualProps> = ({
    value,
    setValue,
    currencyPref,
    ...props
}) => {
    const [localValue, setLocalValue] = React.useState<string>(value);
    const [innerValue, setInnerValue] = React.useState<string>(value);

    const truePrice = useUsdPair(ETH_ONE);

    const prevCurrencyRef = usePrevious(currencyPref);

    const callback = React.useCallback(
        (_currencyPref: 'USD' | 'ETH') => {
            if (_currencyPref === 'USD') {
                setLocalValue(value);
                setInnerValue(truePrice.usd.copy().multiply(value).number.toFixed(2));
            } else {
                setLocalValue(value);
                setInnerValue(value);
            }
        },
        [value, setInnerValue, truePrice.usd],
    );

    React.useEffect(() => {
        if (localValue !== value || prevCurrencyRef === null || currencyPref !== prevCurrencyRef)
            callback(currencyPref);
    }, [currencyPref, callback, prevCurrencyRef, value, localValue]);

    const setValWrapper = React.useCallback(
        (amount: string) => {
            setInnerValue(amount);

            if (!amount.includes('.')) amount += '.0';
            if (amount === '.' || amount === '.0') amount = '0.0';

            let next: string;
            if (currencyPref === 'ETH') next = amount;
            else {
                next = EthInt.tryParseFrac(amount)
                    .divide(truePrice.usd.number)
                    .decimal.toNumber()
                    .toFixed(5);
            }
            setLocalValue(next);
            setValue(next);
        },
        [setInnerValue, setValue, currencyPref, truePrice],
    );

    return <CurrencyInput value={innerValue} setValue={setValWrapper} {...props} />;
};

interface DualIconProps extends Omit<DualProps, 'leftToggles'> {
    iconColor?: string;
    iconSize?: number;
    iconStyle?: React.CSSProperties;
}

export const DualCurrencyInputWithIcon: FunctionComponent<DualIconProps> = ({
    iconColor = lib.colors.primaryColor,
    iconSize = 32,
    iconStyle,
    currencyPref,
    style,
    styleInput,
    ...props
}) => {
    return (
        <DualCurrencyInput
            leftToggles={[
                currencyPref === 'ETH' ? (
                    <SiEthereum
                        color={iconColor}
                        size={iconSize}
                        style={{ left: 10, position: 'absolute', height: '100%', ...iconStyle }}
                    />
                ) : (
                    <IoLogoUsd
                        color={iconColor}
                        size={iconSize}
                        style={{ left: 10, position: 'absolute', height: '100%', ...iconStyle }}
                    />
                ),
            ]}
            currencyPref={currencyPref}
            style={{ position: 'relative', ...style } as React.CSSProperties}
            styleInput={
                {
                    color: lib.colors.primaryColor,
                    textAlign: 'right',
                    padding: '.3rem .5rem',
                    ...styleInput,
                } as React.CSSProperties
            }
            {...props}
        />
    );
};
