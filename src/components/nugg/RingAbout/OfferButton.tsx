import React, { FunctionComponent } from 'react';

import { Route } from '@src/client/router';
import Button from '@src/components/general/Buttons/Button/Button';
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import state from '@src/state';
import web3 from '@src/web3';
import client from '@src/client';

import styles from './RingAbout.styles';

type Props = Record<string, unknown>;

const OfferButton: FunctionComponent<Props> = () => {
    const screenType = state.app.select.screenType();
    const address = web3.hook.usePriorityAccount();
    const tokenId = client.live.lastSwap.tokenId();
    const type = client.live.lastSwap.type();
    const { lifecycle, token } = client.hook.useLiveToken(tokenId);
    // const lifecycle = client.live.activeLifecycle();
    // const token = useAsyncState(async () => {
    //     if (tokenId) {
    //         return (await client.static.token(tokenId)).token;
    //     }
    //     return undefined;
    // }, [tokenId]);

    return lifecycle !== 'shower' && (screenType === 'phone' || address) ? (
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
            onClick={() =>
                screenType === 'phone' && isUndefinedOrNullOrStringEmpty(address)
                    ? state.app.dispatch.changeMobileView('Wallet')
                    : tokenId &&
                      state.app.dispatch.setModalOpen({
                          name: 'OfferModal',
                          modalData: {
                              targetId: tokenId,
                              type: type === Route.SwapItem ? 'OfferItem' : 'OfferNugg',
                              data: {
                                  tokenId,
                                  token,
                                  mustPickNuggToBuyFrom: lifecycle === 'tryout',
                              },
                          },
                      })
            }
            label={
                screenType === 'phone' && isUndefinedOrNullOrStringEmpty(address)
                    ? 'Connect wallet'
                    : 'Place offer'
            }
        />
    ) : null;
};

export default OfferButton;
