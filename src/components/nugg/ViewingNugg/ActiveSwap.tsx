import React, { FunctionComponent } from 'react';
import { t } from '@lingui/macro';
import { IoArrowRedo } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';

import { useLifecycleData } from '@src/client/hooks/useLifecycle';
import { Timer } from '@src/components/mobile/ViewingNuggPhone';
import OffersList from '@src/components/nugg/RingAbout/OffersList';
import lib from '@src/lib';
import { Lifecycle } from '@src/client/interfaces';
import useViewingNugg from '@src/client/hooks/useViewingNugg';
import Button from '@src/components/general/Buttons/Button/Button';
import OfferText from '@src/components/nugg/RingAbout/OfferText';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';

import styles from './ViewingNugg.styles';

type Props = Record<string, never>;

const ActiveSwap: FunctionComponent<Props> = () => {
	const navigate = useNavigate();
	const { safeTokenId: tokenId } = useViewingNugg();
	const [lifecycle, swap, swapCurrency, , seconds] = useLifecycleData(tokenId);

	const MemoizedTimer = React.useMemo(() => {
		return swap && !swap.isPotential && swap?.endingEpoch ? (
			<Timer seconds={seconds ?? 0} resetOn={tokenId} />
		) : null;
	}, [swap, seconds, tokenId]);

	return (
		<div
			style={{
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'space-evenly',
			}}
		>
			<OfferText
				tokenId={tokenId}
				textStyle={{
					...lib.layout.presets.font.main.thicc,
					fontSize: lib.fontSize.h3,
					color: lib.colors.primaryColor,
				}}
			/>
			<div
				style={{
					display: 'flex',
					justifyContent: MemoizedTimer ? 'space-around' : 'center',
					width: '100%',
					alignItems: 'center',
				}}
			>
				<OffersList tokenId={tokenId} onlyLeader />
				{/* <div
					style={{
						background: lib.colors.transparentWhite,
						borderRadius: lib.layout.borderRadius.mediumish,
						boxShadow: lib.layout.boxShadow.basic,
						WebkitBackdropFilter: 'blur(50px)',
						backdropFilter: 'blur(50px)',
						display: 'flex',
						justifyContent: 'center',
						flexDirection: 'column',
						alignItems: 'center',
						padding: '.5rem .6rem',
						paddingLeft: '.8rem',
					}}
				>
					<CurrencyText
						textStyle={{
							color: lib.colors.primaryColor,
							fontSize: '30px',
							display: 'flex',
							alignItems: 'center',
							fontWeight: lib.layout.fontWeight.semibold,
						}}
						stopAnimationOnStart
						value={swapCurrency}
						decimals={3}
						icon
						iconSize={32}
						loadingOnZero
					/>
				</div> */}
				{(lifecycle === Lifecycle.Bench ||
					lifecycle === Lifecycle.Concessions ||
					lifecycle === Lifecycle.Minors) && (
					<div
						style={{
							background: lib.colors.transparentWhite,
							borderRadius: lib.layout.borderRadius.mediumish,
							boxShadow: lib.layout.boxShadow.basic,
							WebkitBackdropFilter: 'blur(50px)',
							backdropFilter: 'blur(50px)',
							display: 'flex',
							justifyContent: 'center',
							flexDirection: 'column',
							alignItems: 'center',
							padding: '.5rem .6rem',
							paddingLeft: '.8rem',
						}}
					>
						<CurrencyText
							textStyle={{
								color: lib.colors.primaryColor,
								fontSize: '30px',
								display: 'flex',
								alignItems: 'center',
								fontWeight: lib.layout.fontWeight.semibold,
							}}
							stopAnimationOnStart
							value={swapCurrency}
							decimals={3}
							icon
							iconSize={32}
							loadingOnZero
						/>
					</div>
				)}
				{MemoizedTimer}
			</div>
			<Button
				buttonStyle={styles.goToSwap}
				textStyle={{
					...styles.goToSwapGradient,
					background: lib.colors.gradient2,
					paddingRight: '.5rem',
					...lib.layout.presets.font.main.thicc,
					fontSize: lib.fontSize.h2_small,
				}}
				label={t`Go to swap`}
				rightIcon={<IoArrowRedo color={lib.colors.green} size={30} />}
				onClick={() => swap && tokenId && navigate(`/swap/${tokenId}`)}
			/>
		</div>
	);
};

export default ActiveSwap;
