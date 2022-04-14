import React from 'react';
import { t } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';

import Button from '@src/components/general/Buttons/Button/Button';
import { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import web3 from '@src/web3';
import client from '@src/client';
import { NuggId, TokenId } from '@src/client/router';
import useLifecycle from '@src/client/hooks/useLifecycle';
import { ModalEnum } from '@src/interfaces/modals';
import useDimentions from '@src/client/hooks/useDimentions';

import styles from './RingAbout.styles';

export default ({
    tokenId,
    sellingNuggId,
}: {
    tokenId: TokenId | undefined;
    sellingNuggId?: NuggId;
}) => {
    const { screen: screenType } = useDimentions();
    const address = web3.hook.usePriorityAccount();
    const token = client.live.token(tokenId);

    const lifecycle = useLifecycle(token);
    const navigate = useNavigate();

    const openModal = client.modal.useOpenModal();

    const isDisabled = React.useMemo(() => {
        return !(
            lifecycle &&
            lifecycle !== 'shower' &&
            lifecycle !== 'stands' &&
            lifecycle !== 'cut' &&
            lifecycle !== 'tryout'
        );
    }, [token, lifecycle]);

    return (
        <Button
            buttonStyle={{
                ...styles.button,
            }}
            textStyle={{
                ...styles.buttonText,
            }}
            disabled={isDisabled}
            onClick={() =>
                screenType === 'phone' && isUndefinedOrNullOrStringEmpty(address)
                    ? navigate('/wallet')
                    : token &&
                      tokenId &&
                      openModal({
                          type: ModalEnum.Offer,
                          tokenId,
                          tokenType: token.type,
                          token,
                          nuggToBuyFrom:
                              token.type === 'item'
                                  ? sellingNuggId || token.activeSwap?.sellingNuggId
                                  : undefined,
                      })
            }
            label={
                !token
                    ? 'Loading...'
                    : isDisabled
                    ? 'swap is over'
                    : screenType === 'phone' && isUndefinedOrNullOrStringEmpty(address)
                    ? t`Connect wallet`
                    : t`Place offer`
            }
        />
    );
};
