import React from 'react';
import { t } from '@lingui/macro';

import Button from '@src/components/general/Buttons/Button/Button';
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import web3 from '@src/web3';
import client from '@src/client';
import useLifecycle from '@src/client/hooks/useLifecycle';
import { ModalEnum } from '@src/interfaces/modals';
import useDimensions from '@src/client/hooks/useDimensions';
import { buildTokenIdFactory } from '@src/prototypes';
import { Lifecycle } from '@src/client/interfaces';
import { Page } from '@src/interfaces/nuggbook';

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
    const { screen: screenType, isPhone } = useDimensions();
    const address = web3.hook.usePriorityAccount();
    const token = client.live.token(tokenId);

    const lifecycle = useLifecycle(tokenId);

    const nuggbookOpen = client.nuggbook.useGotoOpen();

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
            className="mobile-pressable-div"
            buttonStyle={{
                ...styles.button,
                ...(inOverlay && {
                    width: undefined,
                }),
                ...(isPhone && {
                    // border: `5px solid ${lib.colors.nuggBlueSemiTransparent}`,
                    // borderRadius: lib.layout.borderRadius.medium,
                    background: lib.colors.primaryColor,
                }),
            }}
            textStyle={{
                ...styles.buttonText,
                ...(isPhone && {
                    color: lib.colors.white,
                }),
            }}
            disabled={isDisabled}
            onClick={() => {
                if (screenType === 'phone' && isUndefinedOrNullOrStringEmpty(address))
                    nuggbookOpen(Page.Connect);
                else if (token && token.isNugg()) {
                    openModal(
                        buildTokenIdFactory({
                            modalType: ModalEnum.Offer as const,
                            tokenId: token.tokenId,
                            token,
                            nuggToBuyFrom: null,
                            nuggToBuyFor: null,
                            endingEpoch: token.activeSwap?.epoch?.id ?? null,
                        }),
                    );
                } else if (token && token.type === 'item' && token.activeSwap) {
                    openModal(
                        buildTokenIdFactory({
                            modalType: ModalEnum.Offer as const,
                            tokenId: token.tokenId,
                            token,
                            nuggToBuyFrom: sellingNuggId || token.activeSwap.owner,
                            nuggToBuyFor: sellingNuggId || token.activeSwap.owner,
                            endingEpoch: token.activeSwap?.epoch?.id ?? null,
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
                    : lifecycle === Lifecycle.Bench
                    ? 'Accept and Start Auction'
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
