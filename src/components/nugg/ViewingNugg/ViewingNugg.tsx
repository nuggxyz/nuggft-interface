import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useState,
} from 'react';
import { IoEllipsisHorizontal } from 'react-icons/io5';

import { Address } from '@src/classes/Address';
import {
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
    parseTokenId,
} from '@src/lib';
import Colors from '@src/lib/colors';
import constants from '@src/lib/constants';
import AppState from '@src/state/app';
import TokenState from '@src/state/token';
import nuggThumbnailQuery from '@src/state/token/queries/nuggThumbnailQuery';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import Loader from '@src/components/general/Loader/Loader';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import { CONTRACTS } from '@src/web3/config';
import Flyout from '@src/components/general/Flyout/Flyout';
import client from '@src/client';
import HappyTabber from '@src/components/general/HappyTabber/HappyTabber';

import styles from './ViewingNugg.styles';
import OwnerButtons from './FlyoutButtons/OwnerButtons';
import SaleButtons from './FlyoutButtons/SaleButtons';
import LoanButtons from './FlyoutButtons/LoanButtons';
import SwapList from './SwapList';
import ItemList from './ItemList';

type Props = { MobileBackButton?: () => JSX.Element };

const ViewingNugg: FunctionComponent<Props> = ({ MobileBackButton }) => {
    const tokenId = TokenState.select.tokenId();
    const svg = TokenState.select.tokenURI();
    const address = web3.hook.usePriorityAccount();
    const [owner, setOwner] = useState('');
    const [swaps, setSwaps] = useState<NL.GraphQL.Fragments.Swap.Thumbnail[]>([]);
    const [items, setItems] = useState<NL.GraphQL.Fragments.NuggItem.Thumbnail[]>([]);
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

    const happyTabs = useMemo(
        () => [
            {
                label: 'Swaps',
                comp: ({ isActive }) => (
                    <SwapList {...{ chainId, provider, token, tokenIsItem, swaps }} />
                ),
            },
            ...(address === owner
                ? [
                      {
                          label: 'Items',
                          comp: ({ isActive }) => <ItemList />,
                      },
                  ]
                : []),
        ],
        [owner, address, chainId, provider, token, tokenIsItem, swaps],
    );

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
                        <HappyTabber
                            items={happyTabs}
                            bodyStyle={styles.stickyList}
                            headerContainerStyle={{
                                background: Colors.transparentWhite,
                                borderRadius: 0,
                            }}
                        />
                    </div>
                </div>
            </div>
        )
    );
};

export default React.memo(ViewingNugg);
