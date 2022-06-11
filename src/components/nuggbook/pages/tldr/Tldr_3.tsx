import React from 'react';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import { NuggBookPage } from '@src/interfaces/nuggbook';
import useDimensions from '@src/client/hooks/useDimensions';
import useInterval from '@src/hooks/useInterval';
import client from '@src/client';
import TheRingLight from '@src/components/nugg/TheRing/TheRingLight';

const Tldr_3: NuggBookPage = () => {
    const epoch = client.epoch.active.useId();

    // const spring4 = packages.spring.useSpring({
    //     from: {
    //         opacity: 0,
    //     },
    //     to: {
    //         opacity: 1,
    //     },
    //     delay: 500 + 1500 + 1 * 1000,
    //     config: packages.spring.config.default,
    // });

    const [remaining, setRemaining] = React.useState(12);

    useInterval(
        React.useCallback(() => {
            if (remaining <= 0) setRemaining(11);
            else setRemaining(remaining - 1);
        }, [remaining]),
        1000,
    );

    const { screen } = useDimensions();

    return (
        <div
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                marginTop: 20,
                width: screen === 'phone' ? '100%' : '80%',
            }}
        >
            <TheRingLight
                circleWidth={800}
                circleStyle={{ height: '325px' }}
                disableHover
                strokeWidth={3}
                disableClick
                manualTokenId={epoch?.toNuggId()}
                // defaultColor={dynamicTextColor}
                tokenStyle={{ width: '200px', height: '200px' }}
            />

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    borderRadius: lib.layout.borderRadius.large,
                    padding: '.4rem 1rem .8rem',
                    textAlign: 'center',
                    verticalAlign: 'center',
                    marginTop: 10,
                    backgroundColor: 'transparent',
                }}
            >
                <span
                    style={{
                        color: lib.colors.transparentPrimaryColor,
                        ...lib.layout.presets.font.main.semibold,
                        fontWeight: lib.layout.fontWeight.thicc,
                        fontSize: '25px',
                    }}
                >
                    {t`auctions`}
                </span>
            </div>

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    borderRadius: lib.layout.borderRadius.large,
                    padding: '.4rem 1rem 0px',
                    textAlign: 'center',
                    verticalAlign: 'center',
                    marginBottom: '10px',
                    backgroundColor: 'transparent',
                }}
            >
                <span
                    style={{
                        marginLeft: 10,
                        fontSize: '20px',
                        color: lib.colors.transparentPrimaryColor,
                        ...lib.layout.presets.font.main.semibold,
                    }}
                >
                    {t`nuggs can only be traded through specialized auctions`}
                </span>
            </div>
        </div>
    );
};

export default Tldr_3;
