import React, { FC, FunctionComponent } from 'react';
import { t } from '@lingui/macro';

import Button from '@src/components/general/Buttons/Button/Button';
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import state from '@src/state';
import web3 from '@src/web3';
import client from '@src/client';
import TokenViewer from '@src/components/nugg/TokenViewer';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import { TryoutData } from '@src/client/interfaces';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';

import styles from './RingAbout.styles';

type Props = Record<string, unknown>;

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

const OfferButton: FunctionComponent<Props> = () => {
    const screenType = state.app.select.screenType();
    const address = web3.hook.usePriorityAccount();
    const tokenId = client.live.lastSwap.tokenId();
    const token = client.live.token(tokenId);
    const [nuggToBuyFrom, setNuggToBuyFrom] = React.useState<TryoutData>();

    return token &&
        token.lifecycle !== 'shower' &&
        token.lifecycle !== 'stands' &&
        token.lifecycle !== 'cut' &&
        (screenType === 'phone' || address) ? (
        <>
            {/* FIXME */}
            {token && token.type === 'item' && token.tryout.count > 0 && (
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
                    {/* <Button
                        buttonStyle={{
                            ...styles.button,
                            ...(screenType === 'phone' && {
                                background: lib.colors.nuggBlueText,
                            }),
                        }}
                        textStyle={{
                            ...styles.buttonText,
                            ...(screenType === 'phone' && {
                                color: 'white',
                            }),
                        }}
                        disabled={!nuggToBuyFrom}
                        onClick={() =>
                            screenType === 'phone' && isUndefinedOrNullOrStringEmpty(address)
                                ? state.app.dispatch.changeMobileView('Wallet')
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
                            screenType === 'phone' && isUndefinedOrNullOrStringEmpty(address)
                                ? t`Connect wallet`
                                : t`Place offer`
                        }
                    /> */}
                </>
            )}
            <Button
                buttonStyle={{
                    ...styles.button,
                    ...(screenType === 'phone' && {
                        background: lib.colors.nuggBlueText,
                    }),
                }}
                textStyle={{
                    ...styles.buttonText,
                    ...(screenType === 'phone' && {
                        color: 'white',
                    }),
                }}
                disabled={token.lifecycle === 'tryout' && !nuggToBuyFrom}
                onClick={() =>
                    screenType === 'phone' && isUndefinedOrNullOrStringEmpty(address)
                        ? state.app.dispatch.changeMobileView('Wallet')
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
                    screenType === 'phone' && isUndefinedOrNullOrStringEmpty(address)
                        ? t`Connect wallet`
                        : t`Place offer`
                }
            />{' '}
        </>
    ) : null;
};

export default OfferButton;
