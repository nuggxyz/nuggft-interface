import React from 'react';
import { IoIosArrowDropleftCircle } from 'react-icons/io';
import Confetti from 'react-confetti';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import Button from '@src/components/general/Buttons/Button/Button';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import { Peer } from '@src/web3/core/interfaces';
import useIsVisible from '@src/hooks/useIsVisible';

import { PeerButton } from './Setup_0';

const Setup_3: NuggBookPage = ({ setPage }) => {
    const [ref, visible] = useIsVisible(null);
    return (
        <div
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
            }}
            ref={ref}
        >
            <Confetti
                numberOfPieces={60}
                run={visible}
                style={{
                    transition: `opacity .5s ${lib.layout.animation}`,
                    opacity: visible ? 1 : 0,
                }}
            />{' '}
            <Text
                size="larger"
                textStyle={{
                    marginTop: 40,
                    textAlign: 'center',
                    fontWeight: lib.layout.fontWeight.thicc,
                }}
            >
                3️⃣ 🐣 <span style={{ paddingLeft: 5 }}>{t`leggo`}</span>
            </Text>
            <div style={{ padding: '20px 0px', marginTop: 15 }}>
                <Text
                    size="large"
                    textStyle={{ ...lib.layout.presets.font.main.bold, padding: 10 }}
                >
                    <PeerButton
                        peer={Peer.CoinbaseWallet}
                        text={t`connect to nuggft`}
                        color={lib.colors.gradient}
                    />
                </Text>
                <Text
                    size="large"
                    textStyle={{ ...lib.layout.presets.font.main.bold, padding: 10, marginTop: 10 }}
                >
                    <PeerButton
                        peer={Peer.MetaMask}
                        text={t`connect to nuggft`}
                        color={lib.colors.gradient}
                    />
                </Text>
            </div>
            <div style={{ marginTop: 20 }}>
                <Button
                    buttonStyle={{
                        background: lib.colors.gradient2,
                        color: 'white',
                        borderRadius: lib.layout.borderRadius.large,
                        marginBottom: '.4rem',
                        backgroundColor: lib.colors.white,
                        // width: '13rem',
                        alignItems: 'center',
                    }}
                    label={t`back`}
                    leftIcon={
                        <IoIosArrowDropleftCircle
                            color="white"
                            style={{ marginRight: '.3rem' }}
                            size={20}
                        />
                    }
                    onClick={() => setPage(Page.Setup_2, false)}
                />
            </div>
        </div>
    );
};

export default Setup_3;
