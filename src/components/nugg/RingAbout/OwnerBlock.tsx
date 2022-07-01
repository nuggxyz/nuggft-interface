import React, { FC } from 'react';
import { t } from '@lingui/macro';

import { useLifecycleData } from '@src/client/hooks/useLifecycle';
import Text from '@src/components/general/Texts/Text/Text';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import { Lifecycle, LiveNuggItem } from '@src/client/interfaces';
import lib from '@src/lib';
import { useDarkMode } from '@src/client/hooks/useDarkMode';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import TokenViewer from '@src/components/nugg/TokenViewer';
import TheRing from '@src/components/nugg/TheRing/TheRing';
import useDimensions from '@src/client/hooks/useDimensions';
import { Timer } from '@src/components/mobile/ViewingNuggPhone';
import client from '@src/client';

const RenderItem: FC<ListRenderItemProps<LiveNuggItem, undefined, LiveNuggItem>> = ({ item }) => {
	return (
		<div
			style={{
				borderRadius: lib.layout.borderRadius.medium,
				transition: '.2s background ease',
			}}
		>
			<TokenViewer
				tokenId={item.tokenId}
				style={{ width: '60px', height: '60px', margin: '0rem .5rem' }}
			/>
		</div>
	);
};

const OwnerBlock = ({ tokenId }: { tokenId?: TokenId }) => {
	const [lifecycle, swap, swapCurrency, leaderEns, seconds] = useLifecycleData(tokenId);

	const leader = React.useMemo(() => {
		return swap?.isPotential ? undefined : { user: swap?.leader, eth: swap?.top };
	}, [swap]);

	const darkmode = useDarkMode();

	const token = client.live.token(tokenId);

	const { screen: screenType, isPhone } = useDimensions();

	const MemoizedTimer = React.useMemo(() => {
		return swap && !swap.isPotential && swap?.endingEpoch ? (
			<div>
				<Timer seconds={seconds ?? 0} />
			</div>
		) : null;
	}, [swap, seconds]);

	return (
		<div
			style={{
				width: '100%',
				// background: lib.colors.transparentWhite,
				// borderRadius: lib.layout.borderRadius.medium,
				padding: '.5rem',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				// marginTop: '.1rem',
				// marginBottom: isPhone ? 0 : '.5rem',
				// boxShadow: `0px 1px 3px ${lib.colors.shadowNuggBlue}`,
				textAlign: 'center',
			}}
		>
			{swap && lifecycle === Lifecycle.Stands && (
				<>
					<Text
						textStyle={{
							color: 'white',
						}}
					>
						{swap.type === 'item'
							? t`this item is owned by ${99999} nuggs and is not currently for sale`
							: t`Nugg ${tokenId} is happily owned by`}
					</Text>

					{swap.type === 'nugg' && (
						<Text
							textStyle={{
								marginTop: '15px',
								color: 'white',
								fontSize: '32px',
							}}
						>
							{leaderEns}
						</Text>
					)}
				</>
			)}
			{swap && lifecycle === Lifecycle.Cut && (
				<Text
					textStyle={{
						color: 'white',
					}}
				>
					{t`Unfortuantly, Nugg ${tokenId?.toRawId()} did not make it.`}
				</Text>
			)}
			{/* {token && lifecycle !== Lifecycle.Stands && lifecycle !== Lifecycle.Cut && (
            // @danny7even is this logic okay, shoud be same as before but less conditional
            rerendering, i think */}
			<div style={{ display: 'flex', width: '100%', flexDirection: 'column' }}>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						width: '100%',
						alignItems: 'center',
					}}
				>
					<Text
						textStyle={{
							color: lib.colors.white,
							padding: '1rem',
							background: darkmode
								? lib.colors.nuggBlueTransparent
								: lib.colors.transparentGrey,
							borderRadius: lib.layout.borderRadius.medium,
							fontSize: '23px',
						}}
					>
						{tokenId && tokenId.toPrettyId()}
					</Text>

					{leader && lifecycle === Lifecycle.Bench ? (
						<div
							style={{
								alignItems: 'flex-end',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<CurrencyText
								textStyle={{ color: lib.colors.white, fontSize: '28px' }}
								image="eth"
								value={swapCurrency}
								decimals={3}
							/>
							<Text textStyle={{ fontSize: '13px', color: lib.colors.white }}>
								{`${leaderEns || leader?.user || ''} is selling`}
							</Text>
						</div>
					) : lifecycle === Lifecycle.Tryout &&
					  swap &&
					  swap.isItem() &&
					  swap.isPotential &&
					  swap.min ? (
						<div
							style={{
								alignItems: 'flex-end',
								display: 'flex',
								flexDirection: 'column',
							}}
						>
							<CurrencyText
								textStyle={{ color: lib.colors.white, fontSize: '28px' }}
								image="eth"
								value={swapCurrency}
								decimals={3}
							/>
							<Text textStyle={{ fontSize: '13px', color: lib.colors.white }}>
								{t`minimum price`}
							</Text>
						</div>
					) : (
						MemoizedTimer
					)}
				</div>
				{screenType === 'phone' && (
					<div
						style={{
							width: '100%',
							height: '300px',
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center',
							// marginBottom: '20px',
						}}
					>
						<TheRing
							circleWidth={800}
							manualTokenId={swap?.tokenId}
							disableHover
							disableClick
							defaultColor={isPhone ? lib.colors.white : lib.colors.nuggBlue}
							tokenStyle={{ width: '200px', height: '200px' }}
						/>
					</div>
				)}
				{token && token.isNugg() && (
					<List
						data={token.items}
						labelStyle={{
							color: lib.colors.white,
						}}
						extraData={undefined}
						RenderItem={RenderItem}
						horizontal
						style={{
							// width: '100%',
							marginTop: screenType === 'phone' ? '-20px' : '20px',
							background: lib.colors.transparentLightGrey,
							height: '80px',
							padding: '0rem .3rem',
							borderRadius: lib.layout.borderRadius.medium,
						}}
					/>
				)}
			</div>
		</div>
	);
};

export default React.memo(OwnerBlock, (prev, next) => prev.tokenId === next.tokenId);

// const ens = web3.hook.usePriorityAnyENSName(
//     token?.type === 'item' ? 'nugg' : provider,
//     token
//         ? token.activeSwap
//             ? token.activeSwap.owner
//             : token.type === 'nugg'
//             ? token.owner
//             : ''
//         : '',
// );

// @danny7even what is the purpose of this? bypassing it fixes a small rendering delay
//   which makes the ring about not appear as jumpy on first render
// const isItemTryout = useCallback(
//     (_token?: LiveToken | null): _token is RecursiveRequired<LiveItem> =>
//         !isUndefinedOrNullOrBooleanFalse(
//             lifecycle === Lifecycle.Tryout &&
//                 _token &&
//                 _token.type === 'item' &&
//                 !isUndefinedOrNullOrObjectEmpty(_token.tryout.min) &&
//                 !isUndefinedOrNullOrObjectEmpty(_token.tryout.max),
//         ),
//     [lifecycle],
// );

// {
// /* <div style={{ display: 'flex', marginTop: '20px' }}>
//                     <Text
//                         size="small"
//                         textStyle={{
//                             ...lib.layout.presets.font.main.light,
//                             marginRight: '5px',
//                         }}
//                     >
//                         Current Price |{' '}
//                     </Text>
//                     <CurrencyText
//                         size="small"
//                         value={Math.max(
//                             floor?.decimal.toNumber() || 0,
//                             token && token.activeSwap ? token.activeSwap?.eth.number : 0,
//                         )}
//                     />
//                 </div> */
// }
