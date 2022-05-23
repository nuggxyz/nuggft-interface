import React, { CSSProperties, FunctionComponent } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { BigNumber } from 'ethers';
import { t } from '@lingui/macro';

import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Text from '@src/components/general/Texts/Text/Text';
import client from '@src/client';
import { useDarkMode } from '@src/client/hooks/useDarkMode';
import lib from '@src/lib';

type Props = { style?: CSSProperties };

const FloorPrice: FunctionComponent<Props> = ({ style }) => {
    const stake__eps = client.live.stake.eps();
    const stake__shares = client.live.stake.shares();

    const springStyle = useSpring({
        // zIndex: 1000,
        display: 'flex',
        borderRadius: lib.layout.borderRadius.large,
        alignItems: 'center',
        justifyContent: 'center',
        margin: '.3rem 0rem',
        opacity: stake__shares !== BigNumber.from(0) ? 1 : 0,
        ...style,
    });

    const darkmode = useDarkMode();

    return (
        <animated.div style={springStyle}>
            <Text
                type="text"
                size="smaller"
                weight="bolder"
                textStyle={{
                    paddingRight: '.6rem',
                    color: lib.colors.nuggBlueText,
                    ...lib.layout.presets.font.main.bold,
                    marginTop: '.1rem',
                }}
            >
                {t`FLOOR`}
            </Text>
            <CurrencyText
                textStyle={{ color: darkmode ? lib.colors.white : lib.colors.primaryColor }}
                size="small"
                image="eth"
                value={stake__eps?.decimal.toNumber() || 0}
            />
        </animated.div>
    );
};

export default FloorPrice;
