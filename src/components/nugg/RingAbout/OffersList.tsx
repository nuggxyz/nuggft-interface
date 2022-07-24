import React, { FC, useEffect, useState } from 'react';
import { animated, config as springConfig, useSpring } from '@react-spring/web';
import { IoCheckmarkDoneOutline } from 'react-icons/io5';
import { t } from '@lingui/macro';

import client from '@src/client';
import web3 from '@src/web3';
import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import { Lifecycle, OfferData } from '@src/client/interfaces';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import useDimensions from '@src/client/hooks/useDimensions';
import SimpleList, { SimpleListRenderItemProps } from '@src/components/general/List/SimpleList';
import { useLifecycleData } from '@src/client/hooks/useLifecycle';

import styles from './RingAbout.styles';

const OfferRenderItem: FC<SimpleListRenderItemProps<OfferData, undefined, undefined>> = ({
	item,
}) => {
	const provider = web3.hook.usePriorityProvider();
	const leader = client.ens.useEnsOrNuggId(provider, item.account);
	const [, isPhone] = useDimensions();

	const amount = client.usd.useUsdPair(item.eth);
	return (
		<div
			style={{
				position: 'relative',
				padding: '.4rem',
				borderRadius: lib.layout.borderRadius.mediumish,
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center',
				width: '90%',
				marginBottom: '.75rem',
				zIndex: 1,
				paddingLeft: '.4rem',
				background: isPhone ? lib.colors.transparentWhite : lib.colors.transparentLightGrey,
				boxShadow: lib.layout.boxShadow.basic,
			}}
		>
			<CurrencyText image="eth" value={amount} stopAnimation />
			{leader ? (
				<Text type="text" size="smaller" textStyle={{ color: lib.colors.textColor }}>
					{leader}
				</Text>
			) : null}

			{item.txhash && (
				<Button
					buttonStyle={styles.etherscanBtn}
					onClick={() =>
						item.txhash &&
						web3.config.gotoEtherscan(web3.config.DEFAULT_CHAIN, 'tx', item.txhash)
					}
					rightIcon={<IoCheckmarkDoneOutline color={lib.colors.green} size={14} />}
				/>
			)}
		</div>
	);
};

export default React.memo<{
	tokenId?: TokenId;
	sellingNuggId?: NuggId;
	onlyLeader?: boolean;
}>(({ tokenId, onlyLeader }) => {
	const others = client.token.useOffers(tokenId);
	const [lifecycle, swap, swapCurrency] = useLifecycleData(tokenId);
	const chainId = web3.hook.usePriorityChainId();
	const provider = web3.hook.usePriorityProvider();
	const [screenType] = useDimensions();

	const [open, setOpen] = useState(screenType === 'tablet');

	useEffect(() => {
		if (Array.isArray(others) && others.length === 0 && open && screenType !== 'tablet') {
			setOpen(false);
		}
	}, [open, others, screenType]);

	const springStyle = useSpring({
		maxHeight: open ? '300px' : '0px',
		opacity: open ? 1 : 0,
		// padding: open ? '0.75rem' : '0rem',
		pointerEvents: open ? ('auto' as const) : ('none' as const),
	});

	const [flashStyle] = useSpring(() => {
		return {
			to: [
				{
					background: lib.colors.transparentWhite,
				},
				{
					background: lib.colors.transparentWhite,
				},
			],
			from: {
				background: lib.colors.transparentWhite,
			},
			config: springConfig.molasses,
		};
	});

	const leaderEns = web3.hook.usePriorityAnyENSName(
		swap ? (swap.type === 'item' ? 'nugg' : provider) : undefined,
		(swap && swap.isPotential ? undefined : swap?.leader) || undefined,
	);

	const etherscanRef = React.useMemo(() => {
		if (!swap) return undefined;
		if (swap.isPotential) return undefined;

		if (swap.isV2) {
			if (swap.leaderTxHash) {
				return { ref: swap.leaderTxHash, type: 'tx' } as const;
			}
			const top = others.find((o) => o.account === swap.leader);

			if (top && top.txhash) {
				return { ref: top.txhash, type: 'tx' } as const;
			}
			if (swap.leader && !swap.leader.isNuggId()) {
				return { ref: swap.leader, type: 'address' } as const;
			}

			return undefined;
		}

		return undefined;
	}, [swap, others]);

	return swap &&
		!swap.isPotential &&
		lifecycle &&
		lifecycle !== Lifecycle.Concessions &&
		lifecycle !== Lifecycle.Bench &&
		lifecycle !== Lifecycle.Tryout &&
		lifecycle !== Lifecycle.Stands ? (
		<>
			<div
				style={{
					display: 'flex',
					width: '95%',
					background: 'transparent',
					position: 'relative',
					marginTop: onlyLeader ? 0 : 15,
					maxWidth: '300px',
					// zIndex: 5000000000,
				}}
			>
				<animated.div
					className={others.length > 1 && !onlyLeader ? 'mobile-pressable-div' : ''}
					style={{
						display: 'flex',
						justifyContent: 'flex-start',
						alignItems: 'center',
						borderRadius: lib.layout.borderRadius.mediumish,
						padding: '.4rem',
						width: '100%',
						marginBottom: onlyLeader ? '0rem' : '.4rem',
						...flashStyle,
					}}
					onClick={() => setOpen(!open)}
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'center',
							alignItems: 'flex-between',
							background: lib.colors.transparentWhite,
							borderRadius: lib.layout.borderRadius.mediumish,
							padding: '.5rem .6rem',
							marginRight: '.5rem',
							boxShadow: lib.layout.boxShadow.basic,
						}}
					>
						<CurrencyText
							size="small"
							image="eth"
							textStyle={{
								...styles.leadingOffer,
								color: lib.colors.primaryColor,
							}}
							icon
							iconSize={25}
							value={swapCurrency}
						/>
					</div>
					<div style={styles.leadingOfferAmountUser}>
						<Text
							size="smaller"
							type="text"
							textStyle={{ ...lib.layout.presets.font.main.normal }}
						>
							{t`from`}
						</Text>
						<Text textStyle={{ ...lib.layout.presets.font.main.thicc }} size="smaller">
							{leaderEns}
						</Text>
					</div>

					{etherscanRef && (
						<Button
							buttonStyle={{
								position: 'absolute',
								right: '.5rem',
								borderRadius: lib.layout.borderRadius.large,
								background: lib.colors.white,
								padding: '.3rem',
								boxShadow: lib.layout.boxShadow.basic,
							}}
							onClick={() =>
								chainId &&
								web3.config.gotoEtherscan(
									chainId,
									etherscanRef.type,
									etherscanRef.ref,
								)
							}
							rightIcon={
								<IoCheckmarkDoneOutline color={lib.colors.green} size={14} />
							}
						/>
					)}
				</animated.div>
			</div>
			{!onlyLeader && others.length > 1 && (
				<>
					{/* {!isPhone && (
							<div
								className="mobile-pressable-div"
								role="button"
								aria-hidden
								onClick={() => setOpen(!open)}
								style={{
									borderRadius: lib.layout.borderRadius.large,
									background: isPhone
										? lib.colors.primaryColor
										: lib.colors.nuggBlueText,
									margin: '10px',
									display: 'flex',
									alignItems: 'center',
									padding: '0.5rem 1rem',
								}}
							>
								<Text
									size="smaller"
									textStyle={{
										fontWeight: lib.layout.fontWeight.thicc,

										color: lib.colors.white,
									}}
								>
									{open ? t`hide` : t`all offers`}
								</Text>
								{open ? (
									<IoChevronUpCircle
										style={{ marginLeft: '4px' }}
										color="white"
										size={15}
									/>
								) : (
									<IoChevronDownCircle
										style={{ marginLeft: '4px' }}
										color="white"
										size={15}
									/>
								)}
							</div>
						)} */}
					<animated.div
						style={{
							background: lib.colors.transparentWhite,
							width: '100%',
							borderRadius: lib.layout.borderRadius.mediumish,
							...springStyle,
							overflow: 'visible',
							paddingTop: '10px',
						}}
					>
						{/* {distribution && (
                                <div>
                                    <Text>Distribution:</Text>
                                    <Text>
                                        {ownerEns}: {new EthInt(distribution.owner).number}
                                    </Text>
                                    <Text>Protocol: {new EthInt(distribution.proto).number}</Text>
                                    <Text>Staked: {new EthInt(distribution.stake).number}</Text>
                                </div>
                            )} */}
						<SimpleList
							data={others}
							RenderItem={OfferRenderItem}
							extraData={undefined}
						/>
					</animated.div>
				</>
			)}
		</>
	) : null;
});
