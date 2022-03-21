import React, { FunctionComponent, useCallback, useMemo } from 'react';

import Text from '@src/components/general/Texts/Text/Text';
import web3 from '@src/web3';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import client from '@src/client';
import { Lifecycle, LiveToken } from '@src/client/hooks/useLiveToken';
import { LiveItem } from '@src/client/hooks/useLiveItem';
import { isUndefinedOrNullOrBooleanFalse, isUndefinedOrNullOrObjectEmpty } from '@src/lib';

import styles from './RingAbout.styles';

type Props = Record<string, unknown>;

const OwnerBlock: FunctionComponent<Props> = () => {
    const floor = client.live.stake.eps();
    const provider = web3.hook.usePriorityProvider();
    const tokenId = client.live.lastSwap.tokenId();
    const { lifecycle, token } = client.hook.useLiveToken(tokenId);
    // @danny @dub probably delete this later

    // const lifecycle = client.live.activeLifecycle();
    // const token = useAsyncState(async () => {
    //     if (tokenId) {
    //         return (await client.static.token(tokenId)).token;
    //     }
    //     return undefined;
    // }, [tokenId]);

    const ens = web3.hook.usePriorityAnyENSName(
        token?.type === 'item' ? 'nugg' : provider,
        token
            ? token.activeSwap
                ? token.activeSwap.owner
                : token.type === 'nugg'
                ? token.owner
                : ''
            : '',
    );

    const isItemTryout = useCallback(
        (_token?: LiveToken | null): _token is RecursiveRequired<LiveItem> =>
            !isUndefinedOrNullOrBooleanFalse(
                lifecycle === Lifecycle.Tryout &&
                    _token &&
                    _token.type === 'item' &&
                    !isUndefinedOrNullOrObjectEmpty(_token.tryout.min) &&
                    !isUndefinedOrNullOrObjectEmpty(_token.tryout.max),
            ),
        [lifecycle],
    );

    const title = useMemo(() => {
        if (lifecycle === Lifecycle.Stands && token) {
            return token.type === 'item'
                ? 'this item is owned by ___ nuggs and is not currently for sale'
                : 'This nugg is happily owned by';
        }
        let text = 'On sale by';
        if (isItemTryout(token)) {
            text += ` ${token.tryout.count} Nugg${token.tryout.count > 1 ? 's' : ''}`;
        }
        return text;
    }, [token, lifecycle, isItemTryout]);

    return (
        <div style={styles.ownerBlockContainer}>
            <Text size="small" textStyle={styles.textBlue}>
                {title}
            </Text>
            {isItemTryout(token) ? (
                <div>
                    <div style={{ display: 'flex' }}>
                        <CurrencyText
                            stopAnimation
                            image="eth"
                            value={token.tryout.min.eth.decimal.toNumber()}
                            size="small"
                        />
                        {!token.tryout.min.eth.eq(token.tryout.max.eth) && (
                            <Text textStyle={{ marginLeft: '.5rem' }} size="small">
                                Min
                            </Text>
                        )}
                    </div>
                    {!token.tryout.min.eth.eq(token.tryout.max.eth) && (
                        <div style={{ display: 'flex' }}>
                            <CurrencyText
                                stopAnimation
                                size="small"
                                image="eth"
                                value={token.tryout.max.eth.decimal.toNumber()}
                            />
                            <Text textStyle={{ marginLeft: '.5rem' }} size="small">
                                Max
                            </Text>
                        </div>
                    )}
                </div>
            ) : (
                <Text size="medium">{ens}</Text>
            )}
            {token && token.activeSwap?.eth.decimal && (
                <CurrencyText
                    stopAnimation
                    size="small"
                    value={Math.max(
                        floor?.decimal.toNumber() || 0,
                        token.activeSwap?.eth.decimal.toNumber(),
                    )}
                />
            )}
        </div>
    );
};

export default React.memo(OwnerBlock);
