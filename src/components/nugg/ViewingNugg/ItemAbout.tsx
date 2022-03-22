import React from 'react';
import { HiArrowRight } from 'react-icons/hi';

import { Address } from '@src/classes/Address';
import { NuggId } from '@src/client/router';
import Colors from '@src/lib/colors';
import Text from '@src/components/general/Texts/Text/Text';
import client from '@src/client';
import lib from '@src/lib';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import useOnHover from '@src/hooks/useOnHover';
import { LiveItemWithLifecycle, LiveSwap } from '@src/client/interfaces';

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
}: {
    tokenId: NuggId;
    token: LiveItemWithLifecycle;
    epoch: number;
}) => {
    const [ref, hover] = useOnHover(() => undefined);
    const routeTo = client.mutate.routeTo();

    return (
        <>
            {token.tryout.count > 0 && token.tryout.max && token.tryout.min && (
                <div
                    ref={ref}
                    onClick={() => routeTo(tokenId, false)}
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
                            background: lib.colors.gradient2,
                        }}
                    >
                        <div
                            style={{
                                ...styles.swapButton,
                            }}
                        >
                            <Text textStyle={{ color: lib.colors.primaryColor }}>
                                {/* eslint-disable-next-line no-nested-ternary */}
                                {`On sale by ${token.tryout.count} Nugg${
                                    token.tryout.count > 1 ? 's' : ''
                                }`}
                            </Text>
                            {token.tryout.min.eth.eq(token.tryout.max.eth) ? (
                                <div>
                                    <div style={{ display: 'flex' }}>
                                        <CurrencyText
                                            image="eth"
                                            value={token.tryout.min.eth.decimal.toNumber()}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex' }}>
                                        <CurrencyText
                                            image="eth"
                                            value={token.tryout.min.eth.decimal.toNumber()}
                                        />
                                        <Text textStyle={{ marginLeft: '5px' }}>Min</Text>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <CurrencyText
                                            image="eth"
                                            value={token.tryout.max.eth.decimal.toNumber()}
                                        />
                                        <Text textStyle={{ marginLeft: '5px' }}>Max</Text>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {token.activeSwap && (
                <div
                    ref={ref}
                    onClick={() => routeTo(tokenId, false)}
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
                            <CurrencyText
                                image="eth"
                                value={token.activeSwap.eth.decimal.toNumber()}
                            />
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
                                    {`Nugg ${token.activeSwap.owner}`}
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
                                            {token.activeSwap.endingEpoch >= epoch
                                                ? 'Leader'
                                                : 'Buyer'}
                                        </Text>
                                        <Text
                                            textStyle={{
                                                color: 'white',
                                            }}
                                        >
                                            {`Nugg ${token.activeSwap.leader}`}
                                        </Text>
                                    </div>
                                )
                            }
                            {}
                        </div>
                    </div>

                    <div />
                </div>
            )}
        </>
    );
};
