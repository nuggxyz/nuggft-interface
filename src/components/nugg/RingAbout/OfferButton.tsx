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
import { useNavigate } from 'react-router';

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
	const token = client.token.useToken(tokenId);
	const epoch = client.epoch.active.useId();

	const v2 = client.v2.useSwap(tokenId);

	const lifecycle = useLifecycle(tokenId);

	const openModal = client.modal.useOpenModal();

	const isOver = React.useMemo(() => {
		return v2 && epoch && v2.endingEpoch < epoch;
	}, [token, lifecycle, address, epoch, v2]);

	const navigate = useNavigate();

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
			// disabled={isOver}
			onClick={() => {
				if (isUndefinedOrNullOrStringEmpty(address)) {
					openModal({
						modalType: ModalEnum.Wallet,
						containerStyle: { background: lib.colors.transparentWhite },
					});
				} else if (isOver) {
					navigate('/');
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
					: isOver
					? 'Go to current auction'
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
