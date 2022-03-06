import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { IoEllipsisHorizontal } from 'react-icons/io5';

import { Address } from '@src/classes/Address';
import {
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
    parseTokenId,
} from '@src/lib';
import Colors from '@src/lib/colors';
import constants from '@src/lib/constants';
import { fromEth } from '@src/lib/conversion';
import AppState from '@src/state/app';
import TokenState from '@src/state/token';
import nuggThumbnailQuery from '@src/state/token/queries/nuggThumbnailQuery';
import Button from '@src/components/general/Buttons/Button/Button';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import Loader from '@src/components/general/Loader/Loader';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import { CONTRACTS } from '@src/web3/config';
import Flyout from '@src/components/general/Flyout/Flyout';
import StickyList from '@src/components/general/List/StickyList';
import state from '@src/state';
import client from '@src/client';
import { LiveNugg } from '@src/client/hooks/useLiveNugg';
import { LiveItem } from '@src/client/hooks/useLiveItem';

import styles from './ViewingNugg.styles';
import OwnerButtons from './OwnerButtons';
import SaleButtons from './SaleButtons';
import LoanButtons from './LoanButtons';

type Props = { MobileBackButton?: () => JSX.Element };

const ViewingNugg: FunctionComponent<Props> = ({ MobileBackButton }) => {
    const tokenId = TokenState.select.tokenId();
    const svg = TokenState.select.tokenURI();
    const address = web3.hook.usePriorityAccount();
    const [owner, setOwner] = useState('');
    const [swaps, setSwaps] = useState([]);
    const screenType = AppState.select.screenType();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const ens = web3.hook.usePriorityAnyENSName(provider, owner);
    const [showMenu, setShowMenu] = useState<'loan' | 'sale'>();
    const tokenIsItem = useMemo(
        () => tokenId && tokenId.startsWith(constants.ID_PREFIX_ITEM),
        [tokenId],
    );

    const token = client.hook.useLiveToken(tokenId);

    // const getSwapHistory = useCallback(
    //     async (addToResult?: boolean, direction = 'desc') => {
    //         if (tokenId) {
    //             const history = await swapHistoryQuery(
    //                 chainId,
    //                 tokenId,
    //                 direction,
    //                 constants.NUGGDEX_SEARCH_LIST_CHUNK,
    //                 addToResult ? swaps.length : 0,
    //                 tokenIsItem,
    //             );
    //             setSwaps((res) => (addToResult ? [...res, ...history] : history));
    //         }
    //     },
    //     [swaps, tokenId, chainId, tokenIsItem],
    // );

    const getThumbnail = useCallback(async () => {
        const thumbnail = await nuggThumbnailQuery(chainId, tokenId, tokenIsItem);
        if (thumbnail) {
            console.log({ thumbnail });
            setSwaps(thumbnail?.swaps);
            setOwner(thumbnail?.user?.id);
            setShowMenu(
                !isUndefinedOrNullOrObjectEmpty(thumbnail?.activeSwap)
                    ? 'sale'
                    : !isUndefinedOrNullOrObjectEmpty(thumbnail?.activeLoan)
                    ? 'loan'
                    : undefined,
            );
        }
    }, [tokenId, chainId, tokenIsItem]);

    useLayoutEffect(() => {
        setSwaps([]);
        setOwner('');
        getThumbnail();
    }, [tokenId, chainId]);

    useEffect(() => {
        if (!isUndefinedOrNullOrObjectEmpty(token)) {
            getThumbnail();
        }
    }, [token]);

    return (
        !isUndefinedOrNullOrStringEmpty(tokenId) && (
            <div style={styles.container}>
                {MobileBackButton && (
                    <div
                        style={{
                            position: 'fixed',
                            top: '1rem',
                            left: '1rem',
                            zIndex: 101,
                        }}
                    >
                        <MobileBackButton />
                    </div>
                )}
                <div
                    style={
                        screenType == 'phone' ? styles.nuggContainerMobile : styles.nuggContainer
                    }
                >
                    <div style={{ position: 'fixed' }}>
                        <AnimatedCard>
                            <TokenViewer tokenId={tokenId} data={svg} showcase />
                        </AnimatedCard>
                    </div>
                </div>
                <div style={styles.swapsWrapper}>
                    <Swaps
                        {...{
                            chainId,
                            provider,
                            ens,
                            swaps,
                            tokenId,
                            address,
                            owner,
                            showMenu,
                            token,
                            tokenIsItem,
                        }}
                    />
                </div>
            </div>
        )
    );
};

type SwapsProps = {
    chainId: number;
    provider: Web3Provider;
    swaps: NL.GraphQL.Fragments.Swap.Thumbnail[];
    tokenId: string;
    address: string;
    owner: string;
    MobileBackButton?: () => JSX.Element;
    showMenu?: 'sale' | 'loan';
    ens: string;
    token: LiveNugg | LiveItem;
    tokenIsItem: boolean;
};

const Swaps: FunctionComponent<SwapsProps> = ({
    chainId,
    provider,
    swaps,
    tokenId,
    address,
    owner,
    showMenu,
    ens,
    token,
    tokenIsItem,
}) => {
    const screenType = state.app.select.screenType();

    const listData = useMemo(() => {
        let res = [];
        let tempSwaps = [...swaps];
        if (!isUndefinedOrNullOrStringEmpty(token?.activeSwap.id)) {
            res.push({ title: 'Ongoing Sale', items: [token.activeSwap] });
            //@ts-ignore
            tempSwaps = tempSwaps.smartRemove(token.activeSwap, 'id');
        }
        if (
            !isUndefinedOrNullOrObjectEmpty(swaps.find((swap) => swap.endingEpoch === null)) &&
            tokenIsItem
        ) {
            let tempTemp = [];
            let waiting = tempSwaps.reduce((acc, swap) => {
                if (swap.endingEpoch === null) {
                    acc.push(swap);
                } else {
                    tempTemp.push(swap);
                }
                return acc;
            }, []);
            tempSwaps = tempTemp;
            res.push({
                title: 'Awaiting An Offer',
                items: waiting,
            });
        }
        res.push({
            title: 'Previous Sales',
            items: tempSwaps,
        });

        return res;
    }, [swaps, token, tokenIsItem]);

    return (
        <div style={screenType === 'phone' ? styles.swapsMobile : styles.swaps}>
            <div style={styles.owner}>
                <Text textStyle={styles.nuggId}>{parseTokenId(tokenId, true)}</Text>
                <div style={{ marginLeft: '1rem' }}>
                    {owner ? (
                        <>
                            <Text
                                type="text"
                                size="smaller"
                                textStyle={{
                                    color: Colors.nuggBlueText,
                                }}
                            >
                                Owner
                            </Text>
                            <Text textStyle={styles.titleText}>
                                {owner === Address.ZERO.hash ||
                                owner === CONTRACTS[chainId].NuggftV1
                                    ? 'NuggftV1'
                                    : tokenIsItem
                                    ? `Nugg #${owner}`
                                    : ens}
                                {owner === address && (
                                    <Text
                                        type="text"
                                        size="smaller"
                                        textStyle={{ paddingLeft: '.5rem' }}
                                    >
                                        (you)
                                    </Text>
                                )}
                            </Text>
                        </>
                    ) : (
                        <Loader color={Colors.nuggBlueText} />
                    )}
                </div>
                {owner === address && (
                    <Flyout
                        containerStyle={styles.flyout}
                        style={{ right: '1.5rem', top: '2rem' }}
                        button={
                            <div style={styles.flyoutButton}>
                                <IoEllipsisHorizontal color={Colors.white} />
                            </div>
                        }
                    >
                        {showMenu === 'sale' ? (
                            <SaleButtons tokenId={tokenId} />
                        ) : showMenu === 'loan' ? (
                            <LoanButtons tokenId={tokenId} />
                        ) : (
                            <OwnerButtons tokenId={tokenId} />
                        )}
                    </Flyout>
                )}
            </div>
            <StickyList
                data={listData}
                TitleRenderItem={SwapTitle}
                ChildRenderItem={SwapItem}
                extraData={[chainId, provider, token?.activeSwap?.id, tokenIsItem]}
                style={styles.stickyList}
                styleRight={styles.stickyListRight}
            />
        </div>
    );
};

const SwapTitle = ({ title }) => {
    return (
        <div style={{ display: 'flex' }}>
            <Text textStyle={styles.listTitle}>{title}</Text>
        </div>
    );
};

const SwapItem = ({ item, index, extraData }) => {
    console.log({ item });
    const awaitingBid = item?.endingEpoch === null;
    const ens = web3.hook.usePriorityAnyENSName(extraData[1], item.owner.id);
    return (
        <div style={{ padding: '.25rem 1rem' }}>
            <Button
                key={index}
                buttonStyle={styles.swap}
                onClick={() => AppState.onRouteUpdate(extraData[0], `#/swap/${item.id}`)}
                rightIcon={
                    <>
                        <div style={styles.swapButton}>
                            <Text>
                                {awaitingBid
                                    ? 'Awaiting bid!'
                                    : item.num === '0'
                                    ? 'Mint'
                                    : `Swap #${item.num}`}
                            </Text>
                            <CurrencyText image="eth" value={item.eth ? +fromEth(item.eth) : 0} />
                        </div>
                        <div>
                            <Text
                                type="text"
                                size="smaller"
                                textStyle={{
                                    color: Colors.textColor,
                                }}
                            >
                                {awaitingBid || item.id === extraData[2]
                                    ? 'On sale by'
                                    : item.leader.id === item.owner.id
                                    ? 'Reclaimed by'
                                    : 'Purchased from'}
                            </Text>
                            <Text
                                textStyle={{
                                    color: 'white',
                                }}
                            >
                                {item.owner.id === Address.ZERO.hash ||
                                item.owner.id === CONTRACTS[extraData[0]].NuggftV1
                                    ? 'NuggftV1'
                                    : extraData[3]
                                    ? `Nugg #${item.owner.id}`
                                    : ens}
                            </Text>
                        </div>
                    </>
                }
            />
        </div>
    );
};
export default React.memo(ViewingNugg);
