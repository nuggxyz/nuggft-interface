import React, { FunctionComponent, useMemo } from 'react';

import lib, { shortenAddress } from '@src/lib';
import Label from '@src/components/general/Label/Label';
import TokenViewer from '@src/components/nugg/TokenViewer';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import client from '@src/client';
import { GodListRenderItemProps } from '@src/components/general/List/GodList';

import styles from './NuggDexComponents.styles';

const NuggListRenderItemSwap = ({
    item: tokenId,
}: GodListRenderItemProps<TokenId, undefined, undefined>) => {
    const swap = client.swaps.useSwap(tokenId);
    const preference = client.usd.useUsdPair(swap?.eth);
    return swap && tokenId ? (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Label
                text={tokenId.toPrettyId()}
                size="larger"
                containerStyles={{ marginBottom: '10px' }}
            />
            <CurrencyText
                textStyle={{ color: lib.colors.primaryColor }}
                // image="eth"
                value={preference}
                stopAnimation
            />
            {swap.leader && (
                <Label
                    text={swap.isItem() ? swap.leader.toPrettyId() : shortenAddress(swap.leader)}
                />
            )}
        </div>
    ) : null;
};

type Props = GodListRenderItemProps<TokenId, { cardType: 'swap' | 'all' | 'recent' }, TokenId>;

const NuggListRenderItem: FunctionComponent<Props> = ({ item: tokenId, action, extraData }) => {
    const style = useMemo(() => {
        return {
            ...(tokenId ? styles.nuggListRenderItemContainer : {}),
        };
    }, [tokenId]);

    return (
        <div
            id={`item-${tokenId}`}
            aria-hidden="true"
            role="button"
            style={style}
            onClick={() => action && action(tokenId)}
        >
            <TokenViewer
                tokenId={tokenId}
                style={{
                    height: '200px',
                    width: '200px',
                    padding: '1rem',
                }}
                disableOnClick
                // forceCache
                // shouldLoad={isPageLoaded}
            />
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                {extraData?.cardType === 'swap' ? (
                    <NuggListRenderItemSwap item={tokenId} />
                ) : (
                    tokenId && (
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Label
                                text={tokenId.toPrettyId()}
                                size="larger"
                                containerStyles={{ marginBottom: '10px' }}
                            />
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default React.memo(
    NuggListRenderItem,
    (prevProps, props) =>
        prevProps.item === props.item &&
        prevProps.selected === props.selected &&
        JSON.stringify(prevProps.action) === JSON.stringify(props.action),
) as typeof NuggListRenderItem;
