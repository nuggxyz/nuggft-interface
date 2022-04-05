import React from 'react';
import { t } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';

import Button from '@src/components/general/Buttons/Button/Button';
import { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import state from '@src/state';
import web3 from '@src/web3';
import client from '@src/client';
import { NuggId, TokenId } from '@src/client/router';
import useLifecycle from '@src/client/hooks/useLifecycle';

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

    const lifecycle = useLifecycle(token);
    const navigate = useNavigate();

    return token &&
        lifecycle &&
        lifecycle !== 'shower' &&
        lifecycle !== 'stands' &&
        lifecycle !== 'cut' &&
        lifecycle !== 'tryout' &&
        (screenType === 'phone' || address) ? (
        <Button
            buttonStyle={{
                ...styles.button,
            }}
            textStyle={{
                ...styles.buttonText,
            }}
            onClick={() =>
                screenType === 'phone' && isUndefinedOrNullOrStringEmpty(address)
                    ? navigate('/wallet')
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
