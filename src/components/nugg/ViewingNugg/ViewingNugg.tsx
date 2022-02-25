import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';

import { Address } from '../../../classes/Address';
import { isUndefinedOrNullOrStringEmpty } from '../../../lib';
import Colors from '../../../lib/colors';
import constants from '../../../lib/constants';
import { fromEth } from '../../../lib/conversion';
import Layout from '../../../lib/layout';
import AppState from '../../../state/app';
import ProtocolState from '../../../state/protocol';
import TokenState from '../../../state/token';
import nuggThumbnailQuery from '../../../state/token/queries/nuggThumbnailQuery';
import swapHistoryQuery from '../../../state/token/queries/swapHistoryQuery';
import Button from '../../general/Buttons/Button/Button';
import AnimatedCard from '../../general/Cards/AnimatedCard/AnimatedCard';
import Loader from '../../general/Loader/Loader';
import CurrencyText from '../../general/Texts/CurrencyText/CurrencyText';
import Text from '../../general/Texts/Text/Text';
import TokenViewer from '../TokenViewer';
import config from '../../../state/web32/config';
import { useENS } from '../../../state/web32/utils/core';

import styles from './ViewingNugg.styles';

type Props = { MobileBackButton?: () => JSX.Element };

const ViewingNugg: FunctionComponent<Props> = ({ MobileBackButton }) => {
    const tokenId = TokenState.select.tokenId();
    const svg = TokenState.select.tokenURI();
    const address = config.priority.usePriorityAccount();
    const [owner, setOwner] = useState('');
    const [swaps, setSwaps] = useState([]);
    const screenType = AppState.select.screenType();
    const chainId = config.priority.usePriorityChainId();
    const provider = config.priority.usePriorityProvider();
    const ens = config.priority.usePriorityENSName(provider);
    const [items, setItems] = useState([tokenId]);

    useEffect(() => {
        setItems([items[1], tokenId]);
    }, [tokenId, chainId]);

    const getSwapHistory = useCallback(
        async (addToResult?: boolean, direction = 'desc') => {
            if (tokenId) {
                const history = await swapHistoryQuery(
                    chainId,
                    tokenId,
                    direction,
                    constants.NUGGDEX_SEARCH_LIST_CHUNK,
                    addToResult ? swaps.length : 0,
                );
                setSwaps((res) => (addToResult ? [...res, ...history] : history));
            }
        },
        [swaps, tokenId, chainId],
    );

    const getThumbnail = useCallback(async () => {
        const thumbnail = await nuggThumbnailQuery(chainId, tokenId);
        setOwner(thumbnail?.user?.id);
    }, [tokenId, chainId]);

    useEffect(() => {
        setSwaps([]);
        setOwner('');
        getThumbnail();
        getSwapHistory();
    }, [tokenId, chainId]);

    return (
        !isUndefinedOrNullOrStringEmpty(tokenId) && (
            <div
                style={{
                    // flexDirection: AppState.isMobile ? 'column' : 'row',
                    ...styles.wrapper,
                }}>
                <div
                    style={{
                        ...styles.container,
                        ...(screenType === 'phone' && { width: '95%' }),
                    }}>
                    <AnimatedCard>
                        <TokenViewer
                            tokenId={tokenId}
                            data={svg}
                            showLabel={screenType === 'phone'}
                        />
                    </AnimatedCard>
                    <Swaps
                        {...{
                            chainId,
                            provider,
                            ens,
                            swaps,
                            tokenId,
                            address,
                            owner,
                            MobileBackButton,
                        }}
                    />
                </div>
            </div>
        )
    );
};

const Swaps = ({ chainId, provider, swaps, tokenId, address, owner, MobileBackButton, ens }) => {
    const epoch = ProtocolState.select.epoch();
    const filteredSwaps = swaps.filter(
        (swap) => swap.endingEpoch !== null && swap.endingEpoch !== epoch?.id,
    );

    return (
        <div style={styles.swaps}>
            <div style={styles.owner}>
                {MobileBackButton ? (
                    <MobileBackButton />
                ) : (
                    <Text
                        textStyle={{
                            color: 'white',
                            padding: '1rem',
                            background: Colors.nuggBlueSemiTransparent,
                            borderRadius: Layout.borderRadius.small,
                        }}>
                        Nugg #{tokenId}
                    </Text>
                )}
                <div style={{ marginLeft: '1rem' }}>
                    {owner ? (
                        <>
                            <Text
                                type="text"
                                size="smaller"
                                textStyle={{
                                    color: Colors.nuggBlueText,
                                }}>
                                Owner
                            </Text>
                            <Text
                                textStyle={{
                                    color: Colors.nuggBlueText,
                                    display: 'flex',
                                    alignItems: 'center',
                                }}>
                                {ens}
                                {owner === address && (
                                    <Text
                                        type="text"
                                        size="smaller"
                                        textStyle={{ paddingLeft: '.5rem' }}>
                                        (you)
                                    </Text>
                                )}
                            </Text>
                        </>
                    ) : (
                        <Loader color={Colors.nuggBlueText} />
                    )}
                </div>
            </div>
            {owner === address && (
                <div
                    style={{
                        // width: '50%',
                        display: 'flex',
                        padding: '.5rem',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                    <div
                        style={{
                            display: 'flex',
                            borderRadius: Layout.borderRadius.large,
                            overflow: 'hidden',
                            justifyContent: 'center',
                            alignItems: 'center',
                            // marginLeft: '1rem',
                            background: Colors.gradient2Transparent,
                        }}>
                        <Button
                            textStyle={MobileBackButton ? styles.textBlue : styles.textWhite}
                            buttonStyle={{
                                ...styles.button,
                                background: MobileBackButton ? 'white' : 'transparent', //Colors.gradient2Transparent,
                            }}
                            label="Sell"
                            onClick={() =>
                                AppState.dispatch.setModalOpen({
                                    name: 'OfferOrSell',
                                    modalData: {
                                        targetId: tokenId,
                                        type: 'StartSale',
                                    },
                                })
                            }
                        />
                        <Button
                            textStyle={MobileBackButton ? styles.textBlue : styles.textWhite}
                            buttonStyle={{
                                ...styles.button,
                                background: MobileBackButton ? 'white' : 'transparent', //Colors.gradient2Transparent,
                            }}
                            label="Loan"
                            onClick={() =>
                                AppState.dispatch.setModalOpen({
                                    name: 'LoanOrBurn',
                                    modalData: {
                                        targetId: tokenId,
                                        type: 'Loan',
                                        backgroundStyle: {
                                            background: Colors.gradient3,
                                        },
                                    },
                                })
                            }
                        />
                        <Button
                            textStyle={MobileBackButton ? styles.textBlue : styles.textWhite}
                            buttonStyle={{
                                ...styles.button,
                                background: MobileBackButton ? 'white' : 'transparent', //Colors.gradient2Transparent,
                            }}
                            label="Burn"
                            onClick={() =>
                                AppState.dispatch.setModalOpen({
                                    name: 'LoanOrBurn',
                                    modalData: {
                                        targetId: tokenId,
                                        type: 'Burn',
                                        backgroundStyle: {
                                            background: Colors.gradient3,
                                        },
                                    },
                                })
                            }
                        />
                    </div>
                </div>
            )}
            <div style={{ padding: '0rem 1rem 1rem 1rem' }}>
                {swaps.find(
                    (swap) => swap.endingEpoch === null || swap.endingEpoch === epoch?.id,
                ) && (
                    <SwapItem
                        swap={swaps.find(
                            (swap) => swap.endingEpoch === null || swap.endingEpoch === epoch?.id,
                        )}
                        chainId={chainId}
                        provider={provider}
                        index={-1}
                    />
                )}
                {filteredSwaps.length > 0 && (
                    <Text textStyle={{ marginTop: '.5rem' }}>Previous Swaps</Text>
                )}
                <div style={{ overflow: 'scroll' }}>
                    {filteredSwaps.map((swap, index) => (
                        <div key={index}>
                            <SwapItem {...{ chainId, swap, index, provider }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SwapItem = ({ provider, swap, index, chainId }) => {
    const awaitingBid = swap.endingEpoch === null;
    const res = useENS(provider, [swap.owner.id]);
    return (
        <Button
            buttonStyle={styles.swap}
            onClick={() => AppState.onRouteUpdate(chainId, `#/swap/${swap.id}`)}
            rightIcon={
                <>
                    <div
                        style={{
                            width: '100%',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            display: 'flex',
                        }}>
                        <Text>
                            {awaitingBid
                                ? 'Awaiting bid!'
                                : swap.num === '0'
                                ? 'Mint'
                                : `Swap #${swap.num}`}
                        </Text>
                        <CurrencyText image="eth" value={+fromEth(swap.eth)} />
                    </div>
                    <div>
                        <Text
                            type="text"
                            size="smaller"
                            textStyle={{
                                color: Colors.textColor,
                            }}>
                            {awaitingBid ? 'On sale by' : 'Purchased from'}
                        </Text>
                        <Text
                            textStyle={{
                                color: 'white',
                            }}>
                            {swap.owner.id === Address.ZERO.hash ? 'NuggftV1' : res}
                        </Text>
                    </div>
                </>
            }
        />
    );
};
export default React.memo(ViewingNugg);
