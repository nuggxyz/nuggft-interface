import React from 'react';
import { Helmet } from 'react-helmet';
import Confetti from 'react-confetti';
import { animated, config, useSpring } from '@react-spring/web';
import { BsGithub, BsTwitter } from 'react-icons/bs';
import { t } from '@lingui/macro';

import clicker from '@src/assets/images/nugg/clicker2.svg';
import lib from '@src/lib';
import { GradientButt } from '@src/components/mobile/ViewingNuggPhone';
import { gotoLink } from '@src/web3/config';

export default () => {
	const [sty] = useSpring(
		() => ({
			from: {
				maxHeight: '0%',
				opacity: 0,
			},
			to: {
				opacity: 1,
				maxHeight: '100%',
			},
			config: config.molasses,
		}),
		[],
	);
	return (
		<div style={{ width: '100%', height: '100%' }}>
			<Confetti
				style={{ zIndex: 0 }}
				// colors={[
				// 	lib.colors.transparentRed,
				// 	lib.colors.nuggBlueTransparent,
				// 	lib.colors.transparentGreen,
				// 	lib.colors.transparentYellow,
				// ]}
				// gravity={1}
				// numberOfPieces={5000}
				initialVelocityY={{ min: 1, max: 1 }}
				// initialVelocityX={{ min: 1, max: 1 }}
				numberOfPieces={500}
				tweenDuration={60000}
			/>
			<Helmet />

			<div
				style={{
					backdropFilter: 'blur(10px)',
					WebkitBackdropFilter: 'blur(10px)',
					background: lib.colors.transparentWhite,

					zIndex: 1,
					width: '100%',
					height: '100%',
				}}
			>
				<div
					style={{
						width: '100%',
						height: '100%',

						display: 'flex',
						justifyContent: 'space-around',
						alignItems: 'center',
						flexDirection: 'column',
					}}
				>
					<animated.div
						style={{
							width: '100%',

							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							flexDirection: 'column',
							...sty,
						}}
					>
						<div
							style={{
								minWidth: '85px',
								height: '85px',
								background: lib.colors.transparentWhite,
								borderRadius: '22.5%',
								WebkitTapHighlightColor: 'transparent',
								boxShadow: '0 6px 10px rgba(102, 102, 102, 0.4)',
								display: 'flex',
								WebkitBackdropFilter: 'blur(50px)',
								backdropFilter: 'blur(50px)',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<div
								className="home-button"
								aria-hidden="true"
								role="button"
								style={{
									zIndex: 100000000,

									width: '90%',
									height: '90%',
									justifyContent: 'center',
									display: 'flex',
									alignItems: 'center',
									padding: 10,
									background: lib.colors.gradient3,
									borderRadius: '22.5%',
									WebkitTapHighlightColor: 'transparent',
								}}
								onClick={(ev) => {
									ev.preventDefault();
									ev.stopPropagation();
								}}
							>
								{' '}
								<img
									alt="nugg clicker"
									src={clicker}
									height={55}
									style={{
										borderRadius: lib.layout.borderRadius.large,
										objectFit: 'cover',
										pointerEvents: 'none',
									}}
								/>
							</div>
						</div>
						<span
							style={{
								padding: 10,
								...lib.layout.presets.font.main.thicc,
								fontSize: '25px',
								color: lib.colors.primaryColor,
								// marginBottom: -34,
								marginTop: 10,
								marginBottom: -8,
							}}
						>
							welcome to
						</span>
						<GradientButt
							style={{
								borderRadius: '50px',
								padding: '.4rem 2rem 1rem',
								margin: 10,
							}}
							textStyle={{ fontSize: '50px' }}
						>
							nugg.xyz
						</GradientButt>
					</animated.div>

					<animated.div style={{ ...sty }}>
						<div
							style={{
								background: lib.colors.white,
								borderRadius: lib.layout.borderRadius.large,
								boxShadow: lib.layout.boxShadow.basic,
								WebkitBackdropFilter: 'blur(50px)',
								backdropFilter: 'blur(50px)',
								padding: 20,
								margin: 20,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								flexDirection: 'column',
							}}
							className="mobile-pressable-div"
							role="button"
							aria-hidden
							onClick={() => gotoLink('https://app.nugg.xyz')}
						>
							<GradientButt
								style={{
									// marginTop: -10,
									borderRadius: '25px',
									// padding: '10px 20px',
									padding: undefined,
									boxShadow: undefined,
								}}
								gradient={lib.colors.gradient}
								background="transparent"
								textStyle={{ fontSize: '40px' }}
							>
								nuggft
							</GradientButt>
							<span
								style={{
									margin: 10,
									fontSize: '18px',
									color: lib.colors.primaryColor,
									...lib.layout.presets.font.main.thicc,
								}}
							>
								{' '}
								{t`the future of nfts.`}
							</span>
						</div>
						<div
							className="mobile-pressable-div"
							role="button"
							aria-hidden
							style={{
								background: lib.colors.white,
								borderRadius: lib.layout.borderRadius.large,
								boxShadow: lib.layout.boxShadow.basic,
								WebkitBackdropFilter: 'blur(50px)',
								backdropFilter: 'blur(50px)',
								padding: 20,
								margin: 20,
								display: 'flex',
								justifyContent: 'center',
								alignItems: 'center',
								flexDirection: 'column',
							}}
							onClick={() => gotoLink('https://github.com/nuggxyz/dotnugg-v1-core')}
						>
							<GradientButt
								style={{
									// marginTop: -10,
									borderRadius: '25px',
									// padding: '10px 20px',
									padding: undefined,
									boxShadow: undefined,
								}}
								gradient={lib.colors.gradient2}
								background="transparent"
								textStyle={{ fontSize: '40px' }}
							>
								.nugg
							</GradientButt>
							<span
								style={{
									margin: 10,
									fontSize: '18px',
									color: lib.colors.primaryColor,
									...lib.layout.presets.font.main.thicc,
								}}
							>
								{t`your art. on chain.`}
							</span>
						</div>
					</animated.div>

					<animated.div
						style={{
							background: lib.colors.transparentWhite,
							borderRadius: lib.layout.borderRadius.large,
							boxShadow: lib.layout.boxShadow.basic,
							WebkitBackdropFilter: 'blur(50px)',
							backdropFilter: 'blur(50px)',
							display: 'flex',
							justifyContent: 'center',
							flexDirection: 'column',
							alignItems: 'center',
							// width: '80%',
							margin: 10,
							padding: '.5rem 1rem',
							...sty,
						}}
					>
						<div
							className="mobile-pressable-div"
							aria-hidden="true"
							role="button"
							style={{
								margin: 5,

								justifyContent: 'center',
								display: 'flex',
								alignItems: 'center',
								padding: '.5rem .9rem',
								background: 'white',
								borderRadius: lib.layout.borderRadius.large,
								boxShadow: lib.layout.boxShadow.basic,
							}}
							onClick={(event) => {
								event.preventDefault();
								event.stopPropagation();
								gotoLink(`https://mirror.xyz/dub6ix.eth`);
							}}
						>
							<span
								style={{
									color: '#1DA1F2',
									fontSize: 20,
								}}
							>
								🗑
							</span>
							<span
								style={{
									marginLeft: 10,
									fontSize: '25px',
									color: lib.colors.primaryColor,
									...lib.layout.presets.font.main.semibold,
								}}
							>
								{t`read our blog`}
							</span>
						</div>

						{/* <div
							style={{
								display: 'flex',
								justifyContent: 'space-around',
								width: '100%',
								alignItems: 'center',
							}}
						>
							<div
								style={{
									background: lib.colors.transparentWhite,
									borderRadius: lib.layout.borderRadius.medium,
									boxShadow: lib.layout.boxShadow.basic,
									WebkitBackdropFilter: 'blur(50px)',
									backdropFilter: 'blur(50px)',
									padding: 10,
									margin: 10,
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<BsGithub
									className="mobile-pressable-div"
									style={{
										color: lib.colors.primaryColor,
										// filter: `drop-shadow(2px 3px 5px rgb(0 0 0 / 0.4)) hue-rotate(0)`,
									}}
									size={50}
								/>
							</div>
						</div> */}

						<div
							className="mobile-pressable-div"
							aria-hidden="true"
							role="button"
							style={{
								margin: 5,

								justifyContent: 'center',
								display: 'flex',
								alignItems: 'center',
								padding: '.5rem .9rem',
								background: 'white',
								borderRadius: lib.layout.borderRadius.large,
								boxShadow: lib.layout.boxShadow.basic,
							}}
							onClick={(event) => {
								event.preventDefault();
								event.stopPropagation();
								gotoLink(`https://github.com/nuggxyz`);
							}}
						>
							<BsGithub
								style={{
									color: lib.colors.primaryColor,
								}}
								size={25}
							/>
							<span
								style={{
									marginLeft: 10,
									fontSize: '25px',
									color: lib.colors.primaryColor,
									...lib.layout.presets.font.main.semibold,
								}}
							>
								{t`smell our code`}
							</span>
						</div>

						<div
							className="mobile-pressable-div"
							aria-hidden="true"
							role="button"
							style={{
								margin: 5,

								justifyContent: 'center',
								display: 'flex',
								alignItems: 'center',
								padding: '.5rem .9rem',
								background: 'white',
								borderRadius: lib.layout.borderRadius.large,
								boxShadow: lib.layout.boxShadow.basic,
							}}
							onClick={(event) => {
								event.preventDefault();
								event.stopPropagation();
								gotoLink(`https://twitter.com/nuggxyz`);
							}}
						>
							<BsTwitter
								style={{
									color: '#1DA1F2',
								}}
								size={25}
							/>
							<span
								style={{
									marginLeft: 10,
									fontSize: '25px',
									color: lib.colors.primaryColor,
									...lib.layout.presets.font.main.semibold,
								}}
							>
								{t`say hi`}
							</span>
						</div>
					</animated.div>
				</div>
			</div>
		</div>
	);
};

// {/* <div
// 						style={{
// 							borderRadius: '25px',
// 							padding: '10px 20px',
// 							margin: 5,
// 							background: lib.colors.primaryColor,
// 						}}
// 						// gradient={lib.colors.gradient2}
// 					>
// 						<span
// 							style={{
// 								fontSize: '20px',
// 								color: 'white',
// 								...lib.layout.presets.font.main.thicc,
// 							}}
// 						>
// 							build
// 						</span>
// 					</div> */}
