import React from 'react';
import { t } from '@lingui/macro';

import Button from '@src/components/general/Buttons/Button/Button';
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import state from '@src/state';
import web3 from '@src/web3';
import client from '@src/client';
import { NuggId, TokenId } from '@src/client/router';

import styles from './RingAbout.styles';

export default ({
    tokenId,
    sellingNuggId,
}: {
    tokenId: TokenId | undefined;
    sellingNuggId?: NuggId;
}) => {
    const screenType = state.app.select.screenType();
    const address = web3.hook.usePriorityAccount();
    const token = client.live.token(tokenId);

    return token &&
        token.lifecycle !== 'shower' &&
        token.lifecycle !== 'stands' &&
        token.lifecycle !== 'cut' &&
        token.lifecycle !== 'tryout' &&
        (screenType === 'phone' || address) ? (
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
                              type: token.type === 'item' ? 'OfferItem' : 'OfferNugg',
                              data: {
                                  tokenId,
                                  token,
                                  nuggToBuyFrom:
                                      token.type === 'item' &&
                                      (sellingNuggId || token.activeSwap?.sellingNuggId),
                              },
                          },
                      })
            }
            label={
                screenType === 'phone' && isUndefinedOrNullOrStringEmpty(address)
                    ? t`Connect wallet`
                    : t`Place offer`
            }
        />
    ) : null;
};
