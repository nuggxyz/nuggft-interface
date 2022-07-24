import React from 'react';
import { t } from '@lingui/macro';

import Button from '@src/components/general/Buttons/Button/Button';
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import web3 from '@src/web3';
import client from '@src/client';
import useLifecycle from '@src/client/hooks/useLifecycle';
import { ModalEnum } from '@src/interfaces/modals';
import { buildTokenIdFactory } from '@src/prototypes';
import { Lifecycle } from '@src/client/interfaces';

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
	const address = web3.hook.usePriorityAccount();
	const token = client.live.token(tokenId);

	const lifecycle = useLifecycle(tokenId);

	const openModal = client.modal.useOpenModal();

	const isDisabled = React.useMemo(() => {
		return (
			!isUndefinedOrNullOrStringEmpty(address) &&
			!(
				lifecycle &&
				lifecycle !== 'shower' &&
				lifecycle !== 'stands' &&
				lifecycle !== 'cut' &&
				lifecycle !== 'tryout'
			)
		);
	}, [token, lifecycle, address]);

	return lifecycle !== 'tryout' && lifecycle !== 'formality' ? (
		<Button
			className="mobile-pressable-div-shallow"
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
				if (isUndefinedOrNullOrStringEmpty(address)) {
					openModal({
						modalType: ModalEnum.Wallet,
						containerStyle: { background: lib.colors.transparentWhite },
					});
				} else if (token && token.isNugg()) {
					openModal(
						buildTokenIdFactory({
							modalType: ModalEnum.Offer as const,
							tokenId: token.tokenId,
							token,
							nuggToBuyFrom: null,
							nuggToBuyFor: null,
							endingEpoch: token.activeSwap?.endingEpoch ?? null,
						}),
					);
				} else if (token && token.type === 'item' && token.activeSwap) {
					openModal(
						buildTokenIdFactory({
							modalType: ModalEnum.Offer as const,
							tokenId: token.tokenId,
							token,
							nuggToBuyFrom: sellingNuggId || token.activeSwap.owner,
							nuggToBuyFor: undefined,
							endingEpoch: token.activeSwap?.endingEpoch ?? null,
						}),
					);
				}
			}}
			label={
				isUndefinedOrNullOrStringEmpty(address)
					? t`Connect wallet`
					: !token
					? 'Loading...'
					: isDisabled
					? 'swap is over'
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
