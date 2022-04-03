import React, { FC } from 'react';
import { t } from '@lingui/macro';

import Button from '@src/components/general/Buttons/Button/Button';
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import state from '@src/state';
import TokenViewer from '@src/components/nugg/TokenViewer';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import { TryoutData } from '@src/client/interfaces';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import web3 from '@src/web3';
import client from '@src/client';
import { useDarkMode } from '@src/client/hooks/useDarkMode';
import useRemaining from '@src/client/hooks/useRemaining';
import { TokenId } from '@src/client/router';

import styles from './RingAbout.styles';

const TryoutRenderItem: FC<ListRenderItemProps<TryoutData, undefined, TryoutData>> = ({
    item: tryoutData,
    selected,
    action,
}) => {
    return (
        <div
            style={{
                borderRadius: lib.layout.borderRadius.medium,
                transition: '.2s background ease',
                background: selected ? lib.colors.transparentGrey2 : lib.colors.transparent,
                padding: '10px',
            }}
            aria-hidden="true"
            onClick={() => action && action(tryoutData)}
        >
            <TokenViewer
                tokenId={tryoutData.nugg}
                style={{ width: '60px', height: '60px' }}
                disableOnClick
            />

            <CurrencyText
                textStyle={{ fontSize: '10px' }}
                value={tryoutData.eth.number}
                stopAnimation
            />
        </div>
    );
};

export default ({ tokenId }: { tokenId?: TokenId }) => {
    const screenType = state.app.select.screenType();
    const address = web3.hook.usePriorityAccount();
    const epoch = client.live.epoch.id();

    const token = client.live.token(tokenId);
    const [nuggToBuyFrom, setNuggToBuyFrom] = React.useState<TryoutData>();

    const { minutes } = useRemaining(client.live.epoch.default());

    const darkmode = useDarkMode();

    const [showBody, setShowBody] = React.useState(false);

    const mustWaitToBid = React.useMemo(() => {
        return (
            token &&
            epoch &&
            token.activeSwap !== undefined &&
            token.activeSwap.endingEpoch !== epoch
        );
    }, [token, epoch]);
    const toggleMobileWallet = client.mutate.toggleMobileWallet();

    return token && token.type === 'item' && token.tryout.count > 0 ? (
        <div
            style={{
                ...(darkmode ? styles.containerDark : styles.container),
                ...(screenType === 'phone' && {
                    ...styles.mobile,
                }),
                marginTop: '20px',
            }}
        >
            {showBody ? (
                <>
                    <List
                        data={token.tryout.swaps}
                        labelStyle={{
                            color: 'white',
                        }}
                        // label={t`Select a nugg to buy this item from`}
                        extraData={undefined}
                        RenderItem={TryoutRenderItem}
                        selected={nuggToBuyFrom}
                        action={setNuggToBuyFrom}
                        horizontal
                        style={{
                            // width: '100%',
                            marginTop: '20px',
                            background: lib.colors.transparentLightGrey,
                            height: '100px',
                            padding: '0rem .3rem',
                            borderRadius: lib.layout.borderRadius.medium,
                        }}
                    />
                    <Button
                        buttonStyle={{
                            ...styles.button,
                        }}
                        textStyle={{
                            ...styles.buttonText,
                        }}
                        disabled={mustWaitToBid || !nuggToBuyFrom}
                        onClick={() =>
                            screenType === 'phone' && isUndefinedOrNullOrStringEmpty(address)
                                ? toggleMobileWallet()
                                : tokenId &&
                                  state.app.dispatch.setModalOpen({
                                      name: 'OfferModal',
                                      modalData: {
                                          targetId: tokenId,
                                          type: token.type === 'item' ? 'OfferItem' : 'OfferNugg',
                                          data: {
                                              tokenId,
                                              token,
                                              nuggToBuyFrom: nuggToBuyFrom?.nugg,
                                          },
                                      },
                                  })
                        }
                        label={
                            mustWaitToBid
                                ? t`wait ${minutes} minutes to buy from a new nugg`
                                : screenType === 'phone' && isUndefinedOrNullOrStringEmpty(address)
                                ? t`Connect wallet`
                                : t`Place offer`
                        }
                    />
                </>
            ) : (
                <Button
                    onClick={() => setShowBody(true)}
                    label="4 other nuggs are selling this item"
                />
            )}
        </div>
    ) : null;
};
