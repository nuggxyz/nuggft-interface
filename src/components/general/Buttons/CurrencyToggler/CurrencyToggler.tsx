import React from 'react';
import { IoLogoUsd } from 'react-icons/io5';
import { SiEthereum } from 'react-icons/si';

import DualToggler from '@src/components/general/Buttons/DualToggler/DualToggler';
import client from '@src/client/index';

export const useCurrencyTogglerState = (initial = 'ETH' as 'ETH' | 'USD') => {
    return React.useState<'ETH' | 'USD'>(initial);
};

export default ({
    pref,
    setPref,
    floaterStyle,
    containerStyle,
}: {
    pref: 'ETH' | 'USD';
    setPref: (input: 'ETH' | 'USD') => void;
    floaterStyle?: React.CSSProperties;
    containerStyle?: React.CSSProperties;
}) => {
    const usdError = client.usd.useUsdError();
    return !usdError ? (
        <DualToggler
            LeftIcon={SiEthereum}
            RightIcon={IoLogoUsd}
            toggleActiveIndex={(input) => {
                setPref(input === 0 ? 'ETH' : 'USD');
                return undefined;
            }}
            activeIndex={pref === 'ETH' ? 0 : 1}
            floaterStyle={floaterStyle}
            containerStyle={containerStyle}
        />
    ) : null;
};
