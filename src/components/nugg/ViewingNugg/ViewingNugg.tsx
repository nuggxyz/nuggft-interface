import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { Address, EnsAddress } from '../../../classes/Address';
import config from '../../../config';
import { isUndefinedOrNullOrStringEmpty } from '../../../lib';
import Colors from '../../../lib/colors';
import constants from '../../../lib/constants';
import { fromEth } from '../../../lib/conversion';
import Layout from '../../../lib/layout';
import AppState from '../../../state/app';
import TokenState from '../../../state/token';
import nuggThumbnailQuery from '../../../state/token/queries/nuggThumbnailQuery';
import swapHistoryQuery from '../../../state/token/queries/swapHistoryQuery';
import Web3State from '../../../state/web3';
import Button from '../../general/Buttons/Button/Button';
import List from '../../general/List/List';
import Loader from '../../general/Loader/Loader';
import CurrencyText from '../../general/Texts/CurrencyText/CurrencyText';
import Text from '../../general/Texts/Text/Text';
import TokenViewer from '../TokenViewer';

import styles from './ViewingNugg.styles';

type Props = {};

const ViewingNugg: FunctionComponent<Props> = () => {
    const tokenId = TokenState.select.tokenId();
    const address = Web3State.select.web3address();
    const [owner, setOwner] = useState('');
    const [swaps, setSwaps] = useState([]);

    const [items, setItems] = useState([tokenId]);

    useEffect(() => {
        setItems([items[1], tokenId]);
    }, [tokenId]);

    const getSwapHistory = useCallback(
        async (addToResult?: boolean, direction = 'desc') => {
            const history = await swapHistoryQuery(
                tokenId,
                direction,
                constants.NUGGDEX_SEARCH_LIST_CHUNK,
                addToResult ? swaps.length : 0,
            );
            setSwaps((res) => (addToResult ? [...res, ...history] : history));
        },
        [swaps, tokenId],
    );

    const getThumbnail = useCallback(async () => {
        const thumbnail = await nuggThumbnailQuery(tokenId);
        setOwner(thumbnail?.user?.id);
    }, [tokenId]);

    useEffect(() => {
        setSwaps([]);
        setOwner('');
        getThumbnail();
        getSwapHistory();
    }, [tokenId]);

    return (
        !isUndefinedOrNullOrStringEmpty(tokenId) && (
            <div
                style={{
                    // flexDirection: AppState.isMobile ? 'column' : 'row',
                    ...styles.wrapper,
                }}>
                <div style={styles.container}>
                    <TokenViewer tokenId={tokenId} />
                    <Swaps {...{ swaps, tokenId, address, owner }} />
                </div>
            </div>
        )
    );
};

const Swaps = ({ swaps, tokenId, address, owner }) => {
    const ens = Web3State.hook.useEns(owner);

    return (
        <div style={styles.swaps}>
            <div style={styles.owner}>
                <Text
                    textStyle={{
                        color: 'white',
                        padding: '1rem',
                        background: Colors.nuggBlueSemiTransparent,
                        borderRadius: Layout.borderRadius.small,
                    }}>
                    Nugg #{tokenId}
                </Text>
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
                                {ens === config.NUGGFT ||
                                ens === Address.ZERO.hash
                                    ? 'NuggFT'
                                    : ens}
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
                            textStyle={styles.textWhite}
                            buttonStyle={{
                                ...styles.button,
                                background: 'transparent', //Colors.gradient2Transparent,
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
                            textStyle={styles.textWhite}
                            buttonStyle={{
                                ...styles.button,
                                background: 'transparent', //Colors.gradient3Transparent,
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
                            textStyle={styles.textWhite}
                            buttonStyle={{
                                ...styles.button,
                                background: 'transparent', //Colors.gradient3Transparent,
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
                {swaps.find((swap) => swap.endingEpoch === null) && (
                    <SwapItem
                        swap={swaps.find((swap) => swap.endingEpoch === null)}
                        index={-1}
                    />
                )}
                <Text textStyle={{ marginTop: '.5rem' }}>Swaps</Text>
                <div style={{ overflow: 'scroll' }}>
                    {swaps
                        .filter((swap) => swap.endingEpoch !== null)
                        .map((swap, index) => (
                            <div key={index}>
                                <SwapItem {...{ swap, index }} />
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

const SwapItem = ({ swap, index }) => {
    const awaitingBid = swap.endingEpoch === null;
    return (
        <Button
            buttonStyle={styles.swap}
            onClick={() => AppState.onRouteUpdate(`#/swap/${swap.id}`)}
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
                                color: Colors.nuggBlueText,
                            }}>
                            {awaitingBid ? 'On sale by' : 'Purchased from'}
                        </Text>
                        <Text
                            textStyle={{
                                color: 'white',
                            }}>
                            {swap.owner.id === Address.ZERO.hash
                                ? 'NuggFT'
                                : new EnsAddress(swap.owner.id).short}
                        </Text>
                    </div>
                </>
            }
        />
    );
};
export default React.memo(ViewingNugg);
