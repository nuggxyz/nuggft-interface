import React from 'react';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import { NuggBookPage } from '@src/interfaces/nuggbook';
import useDimensions from '@src/client/hooks/useDimensions';
import useInterval from '@src/hooks/useInterval';
import client from '@src/client';

const Welcome_0: NuggBookPage = () => {
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
                width: screen === 'phone' ? undefined : '80%',
            }}
        >
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
                    {t`composition of a nugg`}
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
                    {t`McDonlad's wont answer, so we will`}
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
                    {t`a nugg is a collection of items`}
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
                    {t`the seller takes home their asking price and any proceeds go to nugg holders`}
                </span>
            </div>

            {/* {t`this protects buyers and sellers from attacks by eliminating monitary incentive for an attacker`} */}
        </div>
    );
};

export default Welcome_0;
