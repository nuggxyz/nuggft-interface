import { Web3Provider } from '@ethersproject/providers';
import React from 'react';
import { HiArrowRight } from 'react-icons/hi';

import { Address } from '@src/classes/Address';
import { LiveNugg, LiveSwap } from '@src/client/hooks/useLiveNugg';
import { NuggId } from '@src/client/router';
import Colors from '@src/lib/colors';
import web3 from '@src/web3';
import Text from '@src/components/general/Texts/Text/Text';
import client from '@src/client';
import lib from '@src/lib';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import useOnHover from '@src/hooks/useOnHover';

import styles from './ViewingNugg.styles';

const SwapDesc = ({ item, epoch }: { item: LiveSwap; epoch: number }) => {
    const blocknum = client.live.blocknum();

    return epoch && blocknum ? (
        <Text textStyle={{ color: lib.colors.primaryColor }}>
            {/* eslint-disable-next-line no-nested-ternary */}
            {!item.epoch
                ? 'Awaiting bid!'
                : item.epoch.id < epoch
                ? 'Swap is over'
                : `Swap ending in ${item.epoch.endblock - blocknum} blocks`}
        </Text>
    ) : null;
};

export default ({
    tokenId,
    token,
    epoch,
    provider,
}: {
    tokenId: NuggId;
    token: Required<LiveNugg>;
    epoch: number;
    provider: Web3Provider;
}) => {
    const ownerEns = web3.hook.usePriorityAnyENSName(provider, token.activeSwap.owner);

    const leaderEns = web3.hook.usePriorityAnyENSName(provider, token.activeSwap.leader);
    const [ref, hover] = useOnHover(() => undefined);

    return (
        <div
            ref={ref}
            onClick={() => client.actions.routeTo(tokenId, false)}
            aria-hidden="true"
            role="button"
            style={{
                padding: '.25rem 1rem',
                ...(hover ? { filter: 'brightness(1.1)', cursor: 'pointer' } : {}),
            }}
        >
            <div
                style={{
                    ...styles.swap,
                    background:
                        // eslint-disable-next-line no-nested-ternary
                        !token.activeSwap.epoch
                            ? lib.colors.gradient
                            : token.activeSwap.epoch.id < epoch
                            ? lib.colors.gradient3
                            : lib.colors.gradient2,
                }}
            >
                <div
                    style={{
                        ...styles.swapButton,
                    }}
                >
                    <SwapDesc item={token.activeSwap} epoch={epoch} />
                    <CurrencyText image="eth" value={token.activeSwap.eth.decimal.toNumber()} />
                </div>
                <div style={{ display: 'flex' }}>
                    <div style={{ marginRight: '10px' }}>
                        <Text
                            type="text"
                            size="smaller"
                            textStyle={{
                                color: Colors.textColor,
                            }}
                        >
                            Sold by
                        </Text>
                        <Text
                            textStyle={{
                                color: 'white',
                            }}
                        >
                            {ownerEns}
                        </Text>
                    </div>
                    <div
                        style={{
                            justifyContent: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            marginRight: '10px',
                        }}
                    >
                        <HiArrowRight color={lib.colors.primaryColor} />
                    </div>

                    {
                        // if this swap is awaiting a bid
                        token.activeSwap.endingEpoch === null ||
                        // if this swap is a minting swap and no one has bid on it
                        (token.activeSwap.owner === Address.ZERO.hash &&
                            token.activeSwap.leader === Address.ZERO.hash) ? (
                            <> </>
                        ) : (
                            <div>
                                <Text
                                    type="text"
                                    size="smaller"
                                    textStyle={{
                                        color: Colors.textColor,
                                    }}
                                >
                                    {token.activeSwap.endingEpoch >= epoch ? 'Leader' : 'Buyer'}
                                </Text>
                                <Text
                                    textStyle={{
                                        color: 'white',
                                    }}
                                >
                                    {leaderEns}
                                </Text>
                            </div>
                        )
                    }
                    {}
                </div>
            </div>

            <div />
        </div>
    );
};
