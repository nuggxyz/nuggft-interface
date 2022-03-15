import { animated, config as springConfig, useSpring } from '@react-spring/web';
import React, { FunctionComponent, useEffect } from 'react';

import lib from '@src/lib';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Text from '@src/components/general/Texts/Text/Text';
import { OfferData } from '@src/client/core';
import { Route } from '@src/client/router';
import { EthInt } from '@src/classes/Fraction';
import web3 from '@src/web3';
import Button from '@src/components/general/Buttons/Button/Button';

import styles from './RingAbout.styles';

type Props = { leader: OfferData; type: Route.SwapItem | Route.SwapNugg };

const HighestOffer: FunctionComponent<Props> = ({ leader, type }) => {
    const chainId = web3.hook.usePriorityChainId();

    const provider = web3.hook.usePriorityProvider();

    const tx = web3.hook.usePriorityTx(leader.txhash);

    const ens = web3.hook.usePriorityAnyENSName(
        type === Route.SwapItem ? 'nugg' : provider,
        leader.user,
    );

    const [flashStyle, api] = useSpring(() => {
        return {
            to: [
                {
                    ...styles.leadingOfferAmount,
                    background: 'white',
                },
                {
                    ...styles.leadingOfferAmount,
                    background: lib.colors.transparentWhite,
                },
            ],
            from: {
                ...styles.leadingOfferAmount,
                background: lib.colors.transparentWhite,
            },
            config: springConfig.molasses,
        };
    });

    useEffect(() => {
        api.start({
            to: [
                {
                    ...styles.leadingOfferAmount,
                    background: 'white',
                },
                {
                    ...styles.leadingOfferAmount,
                    background: lib.colors.transparentWhite,
                },
            ],
        });
    }, [leader]);

    return leader && chainId ? (
        <Button
            onClick={() => web3.config.gotoEtherscan(chainId, 'tx', leader.txhash)}
            rightIcon={
                <animated.div style={flashStyle}>
                    <div>
                        <CurrencyText
                            image="eth"
                            textStyle={styles.leadingOffer}
                            value={leader.eth.decimal.toNumber()}
                        />
                        {tx && (
                            <>
                                ⛽️
                                <CurrencyText
                                    decimals={0}
                                    size="smaller"
                                    forceGwei
                                    value={EthInt.fromGwei(tx.gasUsed).decimal.toNumber()}
                                />
                            </>
                        )}
                    </div>
                    <Text>{ens}</Text>
                    {/* <TxViewer
                size="smaller"
                textStyle={{ color: lib.colors.textColor }}
                address={leader && leader.user}
                hash={leader && leader.txhash}
                isNugg={type === Route.SwapItem}
            /> */}
                </animated.div>
            }
        />
    ) : null;
};

export default HighestOffer;
