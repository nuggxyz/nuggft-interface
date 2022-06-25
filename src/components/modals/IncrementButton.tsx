import React from 'react';
import { t } from '@lingui/macro';

import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';

const IncrementButton = React.memo(
    ({
        increment,
        wrappedSetAmount,
        amount,
        lastPressed,
    }: {
        increment: bigint;
        wrappedSetAmount: (amt: string, _lastPressed?: string) => void;
        amount: PairInt;
        lastPressed: string | undefined;
    }) => {
        return (
            <Button
                className="mobile-pressable-div"
                label={increment.toString() === '0' ? t`Min` : `+${increment.toString()}%`}
                onClick={() => {
                    wrappedSetAmount(
                        amount.eth.copy().increase(increment).number.toFixed(5) || '0',
                        increment.toString(),
                    );
                }}
                buttonStyle={{
                    borderRadius: lib.layout.borderRadius.large,
                    padding: '.4rem .7rem',
                    background:
                        lastPressed === increment.toString()
                            ? lib.colors.white
                            : lib.colors.textColor,
                    boxShadow:
                        lastPressed === increment.toString()
                            ? `${lib.layout.boxShadow.medium}`
                            : '',
                    transition: `all .5s ${lib.layout.animation}`,
                }}
                size="medium"
                textStyle={{
                    color:
                        lastPressed === increment.toString()
                            ? lib.colors.textColor
                            : lib.colors.white,
                }}
            />
        );
    },
);
export default IncrementButton;
