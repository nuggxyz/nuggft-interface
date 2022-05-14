import React from 'react';
import { t } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';

import Button from '@src/components/general/Buttons/Button/Button';
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import web3 from '@src/web3';
import client from '@src/client';
import { ModalEnum } from '@src/interfaces/modals';
import { buildTokenIdFactory } from '@src/prototypes';
import { Lifecycle } from '@src/client/interfaces';
import useLifecycleEnhanced from '@src/client/hooks/useLifecycleEnhanced';

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
    const navigate = useNavigate();

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
                    } else if (isUndefinedOrNullOrStringEmpty(address)) navigate('/wallet');
                    else if (swap && swap.isNugg()) {
                        openModal(
                            buildTokenIdFactory({
                                modalType: ModalEnum.Offer as const,
                                tokenId: swap.tokenId,
                                nuggToBuyFrom: null,
                                nuggToBuyFor: null,
                            }),
                        );
                    } else if (swap && swap?.isItem()) {
                        openModal(
                            buildTokenIdFactory({
                                modalType: ModalEnum.Offer as const,
                                tokenId: swap.tokenId,
                                nuggToBuyFrom: sellingNuggId || swap.owner,
                                nuggToBuyFor: sellingNuggId || swap.owner,
                            }),
                        );
                    }
                }}
                label={
                    !swap
                        ? 'Loading...'
                        : lifecycle.lifecycle === Lifecycle.Concessions
                        ? 'Adjust'
                        : lifecycle.lifecycle === Lifecycle.Bench
                        ? 'Accept and Start Auction'
                        : !lifecycle.active
                        ? 'swap is over'
                        : isUndefinedOrNullOrStringEmpty(address)
                        ? t`Connect wallet`
                        : t`Place offer`
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
