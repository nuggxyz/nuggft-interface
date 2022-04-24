import React from 'react';
import { t } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';

import Button from '@src/components/general/Buttons/Button/Button';
import { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import web3 from '@src/web3';
import client from '@src/client';
import useLifecycle from '@src/client/hooks/useLifecycle';
import { ModalEnum } from '@src/interfaces/modals';
import useDimentions from '@src/client/hooks/useDimentions';
import { buildTokenIdFactory } from '@src/prototypes';

import styles from './RingAbout.styles';

export default ({
    tokenId,
    sellingNuggId,
    inOverlay = false,
}: {
    tokenId: TokenId | undefined;
    sellingNuggId?: NuggId;
    inOverlay?: boolean;
}) => {
    const { screen: screenType, isPhone } = useDimentions();
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

    return lifecycle !== 'tryout' && (!isPhone || inOverlay) ? (
        <Button
            buttonStyle={{
                ...styles.button,
                ...(inOverlay && {
                    width: undefined,
                }),
            }}
            textStyle={{
                ...styles.buttonText,
            }}
            disabled={isDisabled}
            onClick={() => {
                if (screenType === 'phone' && isUndefinedOrNullOrStringEmpty(address))
                    navigate('/wallet');
                else if (token && token.isNugg()) {
                    openModal(
                        buildTokenIdFactory({
                            modalType: ModalEnum.Offer as const,
                            tokenId: token.tokenId,
                            token,
                            nuggToBuyFrom: null,
                        }),
                    );
                } else if (token && token.type === 'item' && token.activeSwap) {
                    openModal(
                        buildTokenIdFactory({
                            modalType: ModalEnum.Offer as const,
                            tokenId: token.tokenId,
                            token,
                            nuggToBuyFrom: sellingNuggId || token.activeSwap.owner,
                        }),
                    );
                }
            }}
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
    ) : null;

    // (
    //     <Text size="small" textStyle={{ color: lib.colors.transparentWhite }}>
    //         Tap to view
    //     </Text>
    // );
};
