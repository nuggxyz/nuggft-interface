import React, { FunctionComponent, useMemo } from 'react';
import { plural, t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import client from '@src/client';
import { Lifecycle } from '@src/client/interfaces';
import lib, { parseTokenIdSmart } from '@src/lib';

import styles from './RingAbout.styles';

type Props = Record<string, unknown>;

const OwnerBlock: FunctionComponent<Props> = () => {
    const floor = client.live.stake.eps();
    // const provider = web3.hook.usePriorityProvider();
    const tokenId = client.live.lastSwap.tokenId();
    const token = client.live.token(tokenId);
    // const offers = client.live.offers(tokenId);

    // const ens = web3.hook.usePriorityAnyENSName(
    //     token?.type === 'item' ? 'nugg' : provider,
    //     token
    //         ? token.activeSwap
    //             ? token.activeSwap.owner
    //             : token.type === 'nugg'
    //             ? token.owner
    //             : ''
    //         : '',
    // );

    // @danny7even what is the purpose of this? bypassing it fixes a small rendering delay
    //   which makes the ring about not appear as jumpy on first render
    // const isItemTryout = useCallback(
    //     (_token?: LiveToken | null): _token is RecursiveRequired<LiveItem> =>
    //         !isUndefinedOrNullOrBooleanFalse(
    //             lifecycle === Lifecycle.Tryout &&
    //                 _token &&
    //                 _token.type === 'item' &&
    //                 !isUndefinedOrNullOrObjectEmpty(_token.tryout.min) &&
    //                 !isUndefinedOrNullOrObjectEmpty(_token.tryout.max),
    //         ),
    //     [lifecycle],
    // );

    const title = useMemo(() => {
        if (token && token.lifecycle === Lifecycle.Stands) {
            return token.type === 'item'
                ? t`this item is owned by ${99999} nuggs and is not currently for sale`
                : t`This nugg is happily owned by`;
        }
        let text = 'On sale by';
        if (
            token &&
            token.lifecycle === Lifecycle.Tryout &&
            token.type === 'item' &&
            token.tryout.min &&
            token.tryout.max
        ) {
            text += plural(token.tryout.count, { 1: 'nugg', other: 'nuggs' });
        }
        return text;
    }, [token]);

    return (
        <div style={styles.ownerBlockContainer}>
            {!token?.activeSwap && (
                <Text
                    // size="small"
                    textStyle={{
                        color: lib.colors.nuggBlueText,
                    }}
                >
                    {title}
                </Text>
            )}

            {token &&
            token.lifecycle === Lifecycle.Tryout &&
            token.type === 'item' &&
            token.tryout.min &&
            token.tryout.max ? (
                <div>
                    <div style={{ display: 'flex' }}>
                        <CurrencyText
                            image="eth"
                            value={token.tryout.min.eth.decimal.toNumber()}
                            size="small"
                        />
                        {!token.tryout.min.eth.eq(token.tryout.max.eth) && (
                            <Text textStyle={{ marginLeft: '.5rem' }} size="small">
                                {t`Min`}
                            </Text>
                        )}
                    </div>
                    {!token.tryout.min.eth.eq(token.tryout.max.eth) && (
                        <div style={{ display: 'flex' }}>
                            <CurrencyText
                                size="small"
                                image="eth"
                                value={token.tryout.max.eth.decimal.toNumber()}
                            />
                            <Text textStyle={{ marginLeft: '.5rem' }} size="small">
                                {t`Max`}
                            </Text>
                        </div>
                    )}
                </div>
            ) : (
                // @danny7even is this logic okay, shoud be same as before but less conditional rerendering, i think
                <>
                    <Text
                        size="medium"
                        textStyle={{
                            padding: '7px',
                        }}
                    >
                        {parseTokenIdSmart(tokenId || '')}
                    </Text>
                    <div style={{ display: 'flex' }}>
                        <Text
                            size="small"
                            textStyle={{
                                fontFamily: lib.layout.font.sf.light,
                                marginRight: '5px',
                            }}
                        >
                            Current Price |{' '}
                        </Text>
                        <CurrencyText
                            size="small"
                            value={Math.max(
                                floor?.decimal.toNumber() || 0,
                                token && token.activeSwap ? token.activeSwap?.eth.number : 0,
                            )}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default React.memo(OwnerBlock);
