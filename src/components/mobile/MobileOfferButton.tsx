import React, { FC } from 'react';
import { t } from '@lingui/macro';
import { BigNumber } from '@ethersproject/bignumber';

import Button from '@src/components/general/Buttons/Button/Button';
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import web3 from '@src/web3';
import client from '@src/client';
import { ModalEnum } from '@src/interfaces/modals';
import { buildTokenIdFactory } from '@src/prototypes';
import { Lifecycle } from '@src/client/interfaces';
import { Page } from '@src/interfaces/nuggbook';
import GodListHorizontal from '@src/components/general/List/GodListHorizontal';
import { GodListRenderItemProps } from '@src/components/general/List/GodList';
import TokenViewer from '@src/components/nugg/TokenViewer';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import { useLifecycleData } from '@src/client/hooks/useLifecycle';

type MyNuggToPickFrom = { tokenId: NuggId; eth: BigNumber };

const TryoutRenderItem: FC<GodListRenderItemProps<MyNuggToPickFrom, undefined, number>> = ({
	item,
	selected,
	action,
	index,
}) => {
	const usd = client.usd.useUsdPair(item?.eth);
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
				disableOnClick
			/>

			{item?.eth && (
				<CurrencyText textStyle={{ fontSize: '10px' }} value={usd} stopAnimation />
			)}
		</div>
	);
};
export default ({
	tokenId,
	sellingNuggId,
}: {
	tokenId: TokenId | undefined;
	sellingNuggId?: NuggId;
	inOverlay?: boolean;
}) => {
	const address = web3.hook.usePriorityAccount();

	const [lifecycle, swap] = useLifecycleData(tokenId);

	const nuggbookOpen = client.nuggbook.useGotoOpen();

	const myNuggs = client.user.useNuggs();

	const offers = client.live.offers(tokenId);

	const [selectedMyNuggIndex, setSelectedMyNuggIndex] = React.useState<number>();

	const nuggsThatHaveBid = React.useMemo(() => {
		if (!tokenId || tokenId.isNuggId()) return [];
		const result: { tokenId: NuggId; eth: BigNumber }[] = [];
		const haveNot: { tokenId: NuggId; eth: BigNumber }[] = [];

		myNuggs.forEach((x) => {
			const check = offers.find((offer) => {
				return offer.account === x.tokenId;
			});
			if (check) {
				result.push({ tokenId: x.tokenId, eth: check.eth });
			} else {
				haveNot.push({ tokenId: x.tokenId, eth: BigNumber.from(0) });
			}
		});

		return [...result, ...haveNot].sort((a, b) => (a.eth.gt(b.eth) ? -1 : 1));
	}, [myNuggs, tokenId, offers]);

	const nuggToBuyFor = React.useMemo(() => {
		if (selectedMyNuggIndex !== undefined) {
			return nuggsThatHaveBid[selectedMyNuggIndex]?.tokenId;
		}
		return undefined;
	}, [selectedMyNuggIndex, nuggsThatHaveBid]);

	const openModal = client.modal.useOpenModal();
	if (!swap || !tokenId || !lifecycle || lifecycle === 'tryout') return null;

	return (
		<div
			style={{
				width: '100%',
				padding: '0px 10px',
				// display: 'flex',
				// flexDirection: 'column',
				// alignItems: 'center',
			}}
		>
			{swap?.isItem() && nuggsThatHaveBid.length > 0 && (
				<GodListHorizontal
					data={nuggsThatHaveBid}
					extraData={undefined}
					RenderItem={TryoutRenderItem}
					horizontal
					disableScroll
					startGap={10}
					itemHeight={90}
					action={setSelectedMyNuggIndex}
					style={{
						marginTop: '20px',
						width: '100%',
						background: lib.colors.transparentLightGrey,
						height: '100px',
						padding: '15px 0rem .4rem',
						borderRadius: lib.layout.borderRadius.medium,
					}}
				/>
			)}
			<Button
				className="mobile-pressable-div"
				buttonStyle={{
					marginTop: '20px',
					borderRadius: lib.layout.borderRadius.large,
					background:
						lifecycle === Lifecycle.Concessions
							? lib.colors.orange
							: lib.colors.primaryColor,
					padding: '10px 20px',
				}}
				textStyle={{
					...lib.layout.presets.font.main.thicc,
					color: lib.colors.white,
					fontSize: 24,
				}}
				disabled={
					(lifecycle !== Lifecycle.Bunt &&
						lifecycle !== Lifecycle.Bat &&
						lifecycle !== Lifecycle.Deck &&
						lifecycle !== Lifecycle.Bench &&
						lifecycle !== Lifecycle.Minors) ||
					(swap?.isItem() && !nuggToBuyFor)
				}
				onClick={() => {
					if (lifecycle === Lifecycle.Concessions && tokenId.isNuggId()) {
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
								endingEpoch: swap.isPotential ? null : swap?.endingEpoch ?? null,
							}),
						);
					} else if (
						swap &&
						swap.isItem() &&
						nuggToBuyFor &&
						(sellingNuggId || swap.owner)
					) {
						openModal(
							buildTokenIdFactory({
								modalType: ModalEnum.Offer as const,
								tokenId: swap.tokenId,
								nuggToBuyFrom: sellingNuggId || (swap.owner as NuggId),
								nuggToBuyFor,
								endingEpoch: swap.isPotential ? null : swap.endingEpoch ?? null,
							}),
						);
					}
				}}
				label={
					!swap
						? t`loading...`
						: lifecycle === Lifecycle.Concessions
						? t`adjust`
						: lifecycle === Lifecycle.Bench || lifecycle === Lifecycle.Minors
						? t`start auction`
						: lifecycle === Lifecycle.Egg
						? t`starting soon`
						: lifecycle === Lifecycle.Stands
						? t`swap is over`
						: isUndefinedOrNullOrStringEmpty(address)
						? t`connect wallet`
						: t`place offer`
				}
			/>
		</div>
	);
};
