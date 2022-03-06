import React, { FunctionComponent, useMemo, useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';
import { IoEllipsisHorizontal } from 'react-icons/io5';

import { Address } from '@src/classes/Address';
import {
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
    parseTokenIdSmart,
} from '@src/lib';
import Colors from '@src/lib/colors';
import { fromEth } from '@src/lib/conversion';
import AppState from '@src/state/app';
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
import { Route } from '@src/client/router';

import styles from './ViewingNugg.styles';
import OwnerButtons from './OwnerButtons';
import SaleButtons from './SaleButtons';
import LoanButtons from './LoanButtons';

type Props = { MobileBackButton?: () => JSX.Element };

const ViewingNugg: FunctionComponent<Props> = ({ MobileBackButton }) => {
    const { lastView } = client.router.useRouter();

    const address = web3.hook.usePriorityAccount();

    const screenType = AppState.select.screenType();
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const [showMenu, setShowMenu] = useState<'loan' | 'sale'>();

    const tokenIsItem = useMemo(() => lastView && lastView?.type === Route.ViewItem, [lastView]);

    const token = client.hook.useLiveToken(lastView?.tokenId);

    const ens = web3.hook.usePriorityAnyENSName(provider, (token as LiveNugg)?.owner);

    return (
        !isUndefinedOrNullOrStringEmpty(lastView?.tokenId) && (
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
                            <TokenViewer tokenId={lastView?.tokenId} showcase />
                        </AnimatedCard>
                    </div>
                </div>
                <div style={styles.swapsWrapper}>
                    <Swaps
                        {...{
                            chainId,
                            provider,
                            ens,
                            tokenId: lastView?.tokenId,
                            address,
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
    tokenId: string;
    address: string;
    MobileBackButton?: () => JSX.Element;
    showMenu?: 'sale' | 'loan';
    ens: string;
    token: LiveNugg | LiveItem;
    tokenIsItem: boolean;
};

const Swaps: FunctionComponent<SwapsProps> = ({
    chainId,
    provider,
    tokenId,
    address,
    showMenu,
    ens,
    token,
    tokenIsItem,
}) => {
    const screenType = state.app.select.screenType();

    const listData = useMemo(() => {
        let res = [];
        let tempSwaps = token?.swaps ? [...token.swaps] : [];
        if (!isUndefinedOrNullOrStringEmpty(token?.activeSwap.id)) {
            res.push({ title: 'Ongoing Sale', items: [token?.activeSwap] });
            //@ts-ignore
            tempSwaps = tempSwaps.smartRemove(token?.activeSwap, 'id');
        }
        if (
            !isUndefinedOrNullOrObjectEmpty(
                token?.swaps.find((swap) => swap.endingEpoch === null),
            ) &&
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
    }, [token, tokenIsItem]);

    return (
        <div style={screenType === 'phone' ? styles.swapsMobile : styles.swaps}>
            <div style={styles.owner}>
                <Text textStyle={styles.nuggId}>{parseTokenIdSmart(tokenId)}</Text>
                <div style={{ marginLeft: '1rem' }}>
                    {token?.type === 'nugg' ? (
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
                                {token?.owner === Address.ZERO.hash ||
                                token?.owner === CONTRACTS[chainId].NuggftV1
                                    ? 'NuggftV1'
                                    : ens}
                                {token?.owner === address && (
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
                {token?.type !== 'item' && token?.owner === address && (
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
                extraData={[chainId, provider, token?.activeSwap?.id, tokenIsItem, tokenId]}
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
                onClick={() => client.actions.routeTo(extraData[4], false)}
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
