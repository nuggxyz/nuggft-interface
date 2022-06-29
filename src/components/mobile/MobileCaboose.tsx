import React, { FC } from 'react';
import { t } from '@lingui/macro';

import Button from '@src/components/general/Buttons/Button/Button';
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import TokenViewer from '@src/components/nugg/TokenViewer';
import { MyNuggsData, TryoutData } from '@src/client/interfaces';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import web3 from '@src/web3';
import client from '@src/client';
import useDimensions from '@src/client/hooks/useDimensions';
import { ModalEnum } from '@src/interfaces/modals';
import { buildTokenIdFactory } from '@src/prototypes';
import { EthInt } from '@src/classes/Fraction';
import Label from '@src/components/general/Label/Label';
import { Page } from '@src/interfaces/nuggbook';
import GodListHorizontal from '@src/components/general/List/GodListHorizontal';
import { GodListRenderItemProps } from '@src/components/general/List/GodList';
import Text from '@src/components/general/Texts/Text/Text';

const TryoutRenderItem: FC<GodListRenderItemProps<TryoutData, undefined, number>> = ({
	item: tryoutData,
	selected,
	action,
	index,
}) => {
	const usd = client.usd.useUsdPair(tryoutData?.eth);
	return (
		<div
			style={{
				alignSelf: 'center',
				borderRadius: lib.layout.borderRadius.medium,
				transition: '.2s background ease',
				background: selected ? lib.colors.transparentGrey2 : lib.colors.transparent,
				padding: '10px',
			}}
			aria-hidden="true"
			onClick={() => action && action(index)}
		>
			<TokenViewer
				tokenId={tryoutData?.nugg}
				style={{ width: '60px', height: '60px' }}
				disableOnClick
			/>

			<CurrencyText textStyle={{ fontSize: '10px' }} decimals={3} value={usd} stopAnimation />
		</div>
	);
};

export const MyNuggRenderItem: FC<
	GodListRenderItemProps<FormatedMyNuggsData, undefined, number>
> = ({ item, selected, action, index }) => {
	const disabled = React.useMemo(() => {
		if (item?.activeSwap) return t`currenlty for sale`;
		if (item?.lastBid === 'unable-to-bid') return t`previous claim pending for this item`;
		return undefined;
	}, [item]);

	return (
		<div
			style={{
				alignSelf: 'center',
				borderRadius: lib.layout.borderRadius.medium,
				transition: '.2s background ease',
				background: selected ? lib.colors.transparentGrey2 : lib.colors.transparent,
				padding: '10px',
			}}
			aria-hidden="true"
			onClick={() => action && action(index)}
		>
			<TokenViewer
				tokenId={item?.tokenId}
				style={{ width: '60px', height: '60px' }}
				// showLabel
				disableOnClick
			/>
			{disabled && <Label text={disabled} containerStyles={{ background: 'transparent' }} />}

			{/* <CurrencyText textStyle={{ fontSize: '10px' }} value={usd} stopAnimation /> */}
		</div>
	);
};

type FormatedMyNuggsData = MyNuggsData & { lastBid: EthInt | 'unable-to-bid' | 'user-must-claim' };

export default ({ tokenId }: { tokenId?: ItemId }) => {
	const { isPhone } = useDimensions();
	const address = web3.hook.usePriorityAccount();
	const epoch = client.epoch.active.useId();
	const { minutes } = client.epoch.useEpoch(epoch);
	const token = client.live.token(tokenId);

	const swap = React.useMemo(() => {
		return token?.activeSwap;
	}, [token?.activeSwap]);
	const myNuggs = client.user.useNuggs();

	const [selected, setSelected] = React.useState<TryoutData>();
	const [selectedMyNugg, setSelectedMyNugg] = React.useState<NuggId>();
	const [continued, setContinued] = React.useState<boolean>(false);
	const openModal = client.modal.useOpenModal();

	const mustWaitToBid = React.useMemo(() => {
		return (
			token &&
			epoch &&
			token.activeSwap !== undefined &&
			token.activeSwap.endingEpoch !== epoch
		);
	}, [token, epoch]);

	const nuggbookOpen = client.nuggbook.useGotoOpen();

	const myNuggsFormatted = React.useMemo(() => {
		const nuggId = selected;

		return [...myNuggs].map((x) => {
			const filt = x.unclaimedOffers.filter((y) => {
				return y.itemId === tokenId;
			});

			const curr = filt.find((y) => y.sellingNuggId === nuggId?.nugg);

			return {
				...x,
				lastBid: curr ?? new EthInt(0),
			};
		});
	}, [selected, myNuggs, tokenId]);

	const text = React.useMemo(() => {
		if (selectedMyNugg) return t`continue to start auction`;
		if (token && token.tryout && token.tryout.count && token.tryout.count > 0)
			return t`accept a nugg's asking price`;
		if (token && token.tokenId.toRawIdNum() < 1000) return t`bases are non transferable`;
		return t``;
	}, [token, selectedMyNugg]);

	const [RenderItem, action, data] = React.useMemo(() => {
		if (continued) {
			return [
				MyNuggRenderItem,
				(dat: number | undefined) => {
					if (dat !== undefined) {
						const got = myNuggsFormatted[dat];
						setSelectedMyNugg(got.tokenId);
					}
				},
				myNuggsFormatted,
			] as const;
		}

		return [
			TryoutRenderItem,
			(dat: number | undefined) => {
				if (dat !== undefined) {
					const got = token?.tryout.swaps[dat];
					setSelected(got);
				}
			},
			token?.tryout.swaps || [],
		] as const;
	}, [token?.tryout.swaps, myNuggsFormatted, continued]);

	const currency = client.usd.useUsdPair(selected ? selected.eth : token?.tryout?.min?.eth);

	return (
		<>
			<div
				style={{
					overflow: 'hidden',

					height: 'auto',
					width: '100%',
					alignItems: 'center',
					justifyContent: 'center',
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				{token && token.tryout.min && (
					<div
						style={{
							alignItems: 'center',
							display: 'flex',
							flexDirection: 'column',
							marginBottom: '20px',
							marginTop: '10px',
						}}
					>
						<CurrencyText
							textStyle={{
								color: lib.colors.primaryColor,
								fontSize: '28px',
							}}
							image="eth"
							value={currency}
							decimals={3}
						/>
						<Text
							textStyle={{
								fontSize: '13px',
								color: lib.colors.primaryColor,
							}}
						>
							{selected ? t`selected price` : t`minimum price`}
						</Text>
					</div>
				)}{' '}
			</div>
			<div
				style={{
					marginTop: isPhone ? 0 : '20px',
					width: '90%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',

					// height: !isPhone && !tokenId ? '0px' : '100%',
				}}
			>
				<Text
					textStyle={{
						color: lib.colors.primaryColor,
						...lib.layout.presets.font.main.thicc,
					}}
				>
					{continued
						? !selectedMyNugg
							? t`who should wear it?`
							: t`you will bid as ${selectedMyNugg.toPrettyId()}`
						: text}
				</Text>

				<div style={{ marginTop: '20px', width: '100%' }}>
					<GodListHorizontal
						// @ts-ignore
						data={data}
						extraData={undefined}
						// @ts-ignore
						RenderItem={RenderItem}
						horizontal
						// coreRef={ref}
						disableScroll
						startGap={10}
						itemHeight={90}
						action={action}
						selected={selectedMyNugg}
						style={React.useMemo(
							() => ({
								width: '100%',
								background: lib.colors.transparentLightGrey,
								height: isPhone ? '100px' : '140px',
								padding: '15px 0rem .4rem',
								borderRadius: lib.layout.borderRadius.medium,
							}),
							[isPhone],
						)}
					/>
					<Button
						className="mobile-pressable-div"
						buttonStyle={{
							marginTop: '20px',
							borderRadius: lib.layout.borderRadius.large,
							background: lib.colors.primaryColor,
							padding: '10px 20px',
						}}
						textStyle={{
							...lib.layout.presets.font.main.thicc,
							color: lib.colors.white,
							fontSize: 24,
						}}
						disabled={mustWaitToBid || !selected || (continued && !selectedMyNugg)}
						onClick={() => {
							if (selected) {
								if (isPhone && isUndefinedOrNullOrStringEmpty(address))
									nuggbookOpen(Page.Connect);
								else if (!continued) {
									setContinued(true);
								} else if (tokenId && selectedMyNugg && token)
									openModal(
										buildTokenIdFactory({
											modalType: ModalEnum.Offer as const,
											tokenId,
											token,
											nuggToBuyFrom: selected.nugg,
											nuggToBuyFor: selectedMyNugg,
											endingEpoch: token.activeSwap?.endingEpoch ?? null,
										}),
									);
							}
						}}
						label={
							continued
								? selectedMyNugg
									? t`review`
									: t`select a nugg from your roost`
								: mustWaitToBid
								? t`wait ${minutes} min`
								: isPhone && isUndefinedOrNullOrStringEmpty(address)
								? t`connect wallet`
								: !selected
								? t`select a nugg`
								: !swap?.endingEpoch
								? t`continue`
								: t`place offer`
						}
					/>
				</div>
			</div>
		</>
	);
};
