import React from 'react';
import { t } from '@lingui/macro';

import Button from '@src/components/general/Buttons/Button/Button';
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import web3 from '@src/web3';
import client from '@src/client';
import { ModalEnum } from '@src/interfaces/modals';
import { buildTokenIdFactory } from '@src/prototypes';
import { Lifecycle } from '@src/client/interfaces';
import useLifecycleEnhanced from '@src/client/hooks/useLifecycleEnhanced';
import { Page } from '@src/interfaces/nuggbook';

export default ({
    tokenId,
    sellingNuggId,
}: {
    tokenId: TokenId | undefined;
    sellingNuggId?: NuggId;
    inOverlay?: boolean;
}) => {
    const address = web3.hook.usePriorityAccount();
    const swap = client.swaps.useSwap(tokenId);

    const lifecycle = useLifecycleEnhanced(swap);
    const nuggbookOpen = client.nuggbook.useGotoOpen();

    const openModal = client.modal.useOpenModal();

    if (!swap || !tokenId || !lifecycle || lifecycle?.lifecycle === 'tryout') return null;

    return (
        <div style={{ width: '100%', padding: '0px 10px', marginTop: '20px' }}>
            <Button
                className="mobile-pressable-div"
                buttonStyle={{
                    borderRadius: lib.layout.borderRadius.large,
                    background:
                        lifecycle.lifecycle === Lifecycle.Concessions
                            ? lib.colors.orange
                            : lib.colors.primaryColor,
                }}
                textStyle={{
                    color: lib.colors.white,
                    fontSize: 24,
                }}
                disabled={
                    !lifecycle.active &&
                    lifecycle.lifecycle !== Lifecycle.Concessions &&
                    lifecycle.lifecycle !== Lifecycle.Minors &&
                    lifecycle.lifecycle !== Lifecycle.Bench
                }
                onClick={() => {
                    if (lifecycle.lifecycle === Lifecycle.Concessions && tokenId.isNuggId()) {
                        openModal(
                            buildTokenIdFactory({
                                modalType: ModalEnum.Sell as const,
                                tokenId,
                                sellingNuggId: null,
                            }),
                        );
                    } else if (isUndefinedOrNullOrStringEmpty(address)) nuggbookOpen(Page.Connect);
                    else if (swap && swap.isNugg()) {
                        openModal(
                            buildTokenIdFactory({
                                modalType: ModalEnum.Offer as const,
                                tokenId: swap.tokenId,
                                nuggToBuyFrom: null,
                                nuggToBuyFor: null,
                                endingEpoch: swap.epoch?.id ?? null,
                            }),
                        );
                    } else if (swap && swap?.isItem()) {
                        openModal(
                            buildTokenIdFactory({
                                modalType: ModalEnum.Offer as const,
                                tokenId: swap.tokenId,
                                nuggToBuyFrom: sellingNuggId || swap.owner,
                                nuggToBuyFor: sellingNuggId || swap.owner,
                                endingEpoch: swap.epoch?.id ?? null,
                            }),
                        );
                    }
                }}
                label={
                    !swap
                        ? t`loading...`
                        : lifecycle.lifecycle === Lifecycle.Concessions
                        ? t`adjust`
                        : lifecycle.lifecycle === Lifecycle.Bench ||
                          lifecycle.lifecycle === Lifecycle.Minors
                        ? t`accept and start auction`
                        : !lifecycle.active
                        ? t`swap is over`
                        : isUndefinedOrNullOrStringEmpty(address)
                        ? t`connect wallet`
                        : t`place offer`
                }
            />
        </div>
    );

    // (
    //     <Text size="small" textStyle={{ color: lib.colors.transparentWhite }}>
    //         Tap to view
    //     </Text>
    // );
};
