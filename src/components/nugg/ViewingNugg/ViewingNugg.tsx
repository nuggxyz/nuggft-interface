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
import { isUndefinedOrNullOrObjectEmpty, isUndefinedOrNullOrStringEmpty } from '@src/lib';
import Colors from '@src/lib/colors';
import constants from '@src/lib/constants';
import { fromEth } from '@src/lib/conversion';
import AppState from '@src/state/app';
import ProtocolState from '@src/state/protocol';
import TokenState from '@src/state/token';
import nuggThumbnailQuery from '@src/state/token/queries/nuggThumbnailQuery';
import swapHistoryQuery from '@src/state/token/queries/swapHistoryQuery';
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
    const [items, setItems] = useState([tokenId]);
    const [showMenu, setShowMenu] = useState<'loan' | 'sale'>();

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
        setShowMenu(
            !isUndefinedOrNullOrObjectEmpty(thumbnail?.activeSwap)
                ? 'sale'
                : !isUndefinedOrNullOrObjectEmpty(thumbnail?.activeLoan)
                ? 'loan'
                : undefined,
        );
    }, [tokenId, chainId]);

    useLayoutEffect(() => {
        setSwaps([]);
        setOwner('');
        getThumbnail();
        getSwapHistory();
    }, [tokenId, chainId]);

    return (
        !isUndefinedOrNullOrStringEmpty(tokenId) && (
            <div
                style={{
                    ...styles.container,
                    ...(screenType === 'phone' && { padding: '0rem .5rem' }),
                }}
            >
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
                            <TokenViewer tokenId={tokenId} data={svg} />
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
}) => {
    const epoch = ProtocolState.select.epoch();
    const screenType = state.app.select.screenType();

    const listData = useMemo(() => {
        let activeSwap = undefined;
        const filteredSwaps = swaps.filter((swap) => {
            if (swap.endingEpoch !== null && +swap.endingEpoch !== +epoch?.id) {
                return true;
            } else {
                activeSwap = swap;
                return false;
            }
        });

        let res = [];
        if (!isUndefinedOrNullOrObjectEmpty(activeSwap)) {
            res.push({ title: 'Ongoing Sale', items: [activeSwap] });
        }
        res.push({
            title: 'Previous Sales',
            items: filteredSwaps,
        });

        return res;
    }, [swaps, epoch]);

    return (
        <div style={screenType === 'phone' ? styles.swapsMobile : styles.swaps}>
            <div style={styles.owner}>
                <Text textStyle={styles.nuggId}>Nugg #{tokenId}</Text>
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
                        style={{ right: '1rem', top: '2rem' }}
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
                extraData={[chainId, provider]}
                style={{ height: '100%' }}
                styleRight={styles.stickyList}
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
    const awaitingBid = item.endingEpoch === null;
    const ens = web3.hook.usePriorityAnyENSName(extraData[1], item.leader.id);
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
                            <CurrencyText image="eth" value={+fromEth(item.eth)} />
                        </div>
                        <div>
                            <Text
                                type="text"
                                size="smaller"
                                textStyle={{
                                    color: Colors.textColor,
                                }}
                            >
                                {awaitingBid ? 'On sale by' : 'Purchased from'}
                            </Text>
                            <Text
                                textStyle={{
                                    color: 'white',
                                }}
                            >
                                {item.owner.id === Address.ZERO.hash ||
                                item.owner.id === CONTRACTS[extraData[0]].NuggftV1
                                    ? 'NuggftV1'
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
