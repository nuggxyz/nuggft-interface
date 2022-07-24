import React, { FC } from 'react';
import { t } from '@lingui/macro';

import Button from '@src/components/general/Buttons/Button/Button';
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import TokenViewer from '@src/components/nugg/TokenViewer';
import { TryoutData } from '@src/client/interfaces';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import client from '@src/client';
import { ModalEnum } from '@src/interfaces/modals';
import { buildTokenIdFactory } from '@src/prototypes';
import GodListHorizontal from '@src/components/general/List/GodListHorizontal';
import { GodListRenderItemProps } from '@src/components/general/List/GodList';
import web3 from '@src/web3';
import Text from '@src/components/general/Texts/Text/Text';

import styles from './RingAbout.styles';

const TryoutRenderItem: FC<GodListRenderItemProps<TryoutData, undefined, TryoutData>> = ({
	item: tryoutData,
	selected,
	action,
}) => {
	const usd = client.usd.useUsdPair(tryoutData?.eth);
	return (
		<div
			style={{
				borderRadius: lib.layout.borderRadius.medium,
				transition: '.2s background ease',
				backgroundColor: selected ? lib.colors.transparentWhite : lib.colors.transparent,
				padding: '10px',
				cursor: 'pointer',
			}}
			aria-hidden="true"
			onClick={() => action && action(tryoutData)}
		>
			<TokenViewer
				tokenId={tryoutData?.nugg}
				style={{ width: '60px', height: '60px' }}
				disableOnClick
				showLabel
				textProps={{ size: 'smaller' }}
			/>

			<CurrencyText
				textStyle={{
					fontSize: '10px',
					backgroundColor: lib.colors.transparentWhite,
					borderRadius: lib.layout.borderRadius.large,
					padding: '0rem .2rem',
					marginTop: '.2rem',
				}}
				value={usd}
				stopAnimation
			/>
		</div>
	);
};

export default ({
	tokenId,
	onSelectNugg,
}: {
	tokenId?: ItemId;
	onSelectNugg?: (dat: TryoutData) => void;
	onContinue?: () => void;
	onSelectMyNugg?: (tokenId: NuggId) => void;
}) => {
	const token = client.token.useToken(tokenId);
	const address = web3.hook.usePriorityAccount();
	const [nuggToBuyFrom, setNuggToBuyFrom] = React.useState<TryoutData>();
	const openModal = client.modal.useOpenModal();

	return token && token.isItem() && token.tryout.count > 0 && !token.activeSwap ? (
		<div style={{ width: '100%' }}>
			<GodListHorizontal
				data={token.tryout.swaps}
				itemHeight={105}
				labelStyle={{ color: 'white', paddingTop: '0rem' }}
				extraData={undefined}
				RenderItem={TryoutRenderItem}
				selected={nuggToBuyFrom}
				action={(dat?: TryoutData) => {
					setNuggToBuyFrom(dat);
					if (onSelectNugg && dat) onSelectNugg(dat);
				}}
				horizontal
				style={{
					width: '100%',
					background: lib.colors.transparentLightGrey,
					height: '120px',
					padding: '0rem .3rem',
					borderRadius: lib.layout.borderRadius.medium,
				}}
			/>
			<Text
				textStyle={{
					width: '100%',
					color: 'white',
					textAlign: 'center',
					margin: '.3rem 0rem',
				}}
			>
				{nuggToBuyFrom
					? t`On sale by ${nuggToBuyFrom.nugg.toPrettyId()}`
					: t`Select a nugg to buy ${tokenId?.toPrettyId()} from`}
			</Text>
			<Button
				className="mobile-pressable-div-shallow"
				buttonStyle={{
					...styles.button,
				}}
				textStyle={{
					...styles.buttonText,
				}}
				disabled={!nuggToBuyFrom && !isUndefinedOrNullOrStringEmpty(address)}
				onClick={() => {
					if (nuggToBuyFrom && tokenId && token) {
						openModal(
							buildTokenIdFactory({
								modalType: ModalEnum.Offer as const,
								tokenId,
								token,
								nuggToBuyFrom: nuggToBuyFrom.nugg,
								// nuggToBuyFor: null,
								endingEpoch: token.activeSwap?.endingEpoch ?? null,
							}),
						);
					} else if (isUndefinedOrNullOrStringEmpty(address)) {
						openModal({
							modalType: ModalEnum.Wallet,
							containerStyle: { background: lib.colors.transparentWhite },
						});
					}
				}}
				label={isUndefinedOrNullOrStringEmpty(address) ? t`Connect wallet` : t`Place offer`}
			/>
		</div>
	) : null;
};
