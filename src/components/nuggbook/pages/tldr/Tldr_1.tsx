import React from 'react';
import { t } from '@lingui/macro';
import { BsGithub } from 'react-icons/bs';

import vscode from '@src/assets/images/app_logos/vscode.svg';
import ehterscan_dark from '@src/assets/images/app_logos/etherscan-logo-dark.svg';
import lib from '@src/lib';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import eth from '@src/assets/images/app_logos/eth.png';
import { gotoLink, gotoEtherscan } from '@src/web3/config';
import { DEFAULT_CONTRACTS, DEFAULT_CHAIN } from '@src/web3/constants';
import useDimensions from '@src/client/hooks/useDimensions';
import packages from '@src/packages';

const Welcome_0: NuggBookPage = ({ setPage }) => {
	// const setInit = client.nuggbook.useSetInit();

	const spring4 = packages.spring.useSpring({
		from: {
			opacity: 0,
		},
		to: {
			opacity: 1,
		},
		delay: 500 + 1500 + 1 * 1000,
		config: packages.spring.config.default,
	});

	const [screen] = useDimensions();

	return (
		<div
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
				flexDirection: 'column',
				marginTop: 20,
				width: screen === 'phone' ? undefined : '80%',
			}}
		>
			<img
				alt="ethereum logo"
				src={eth}
				height={50}
				style={{
					objectFit: 'cover',
					marginBottom: 10,
				}}
			/>

			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					position: 'relative',
					borderRadius: lib.layout.borderRadius.large,
					padding: '.4rem 1rem .8rem',
					textAlign: 'center',
					verticalAlign: 'center',
					// marginBottom: '.4rem',
					backgroundColor: 'transparent',
				}}
			>
				<span
					style={{
						marginLeft: 10,
						color: lib.colors.transparentPrimaryColor,
						...lib.layout.presets.font.main.semibold,
						fontWeight: lib.layout.fontWeight.thicc,
						fontSize: '25px',
					}}
				>
					{t`built on ethereum`}
				</span>
			</div>

			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					position: 'relative',
					borderRadius: lib.layout.borderRadius.large,
					padding: '.4rem 1rem 0px',
					textAlign: 'center',
					verticalAlign: 'center',
					marginBottom: '10px',
					backgroundColor: 'transparent',
				}}
			>
				<span
					style={{
						marginLeft: 10,
						fontSize: '20px',
						color: lib.colors.transparentPrimaryColor,
						...lib.layout.presets.font.main.semibold,
					}}
				>
					{t`every image you see is 100% computed on ethereum`}
				</span>
			</div>

			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					position: 'relative',
					borderRadius: lib.layout.borderRadius.large,
					padding: '.4rem 1rem 0px',
					textAlign: 'center',
					verticalAlign: 'center',
					marginBottom: '10px',
					backgroundColor: 'transparent',
				}}
			>
				<span
					style={{
						marginLeft: 10,
						fontSize: '20px',
						color: lib.colors.transparentPrimaryColor,
						...lib.layout.presets.font.main.semibold,
					}}
				>
					{t`we designed a language to define items and a smart contract to combine them into nuggs`}
				</span>
			</div>

			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					position: 'relative',
					borderRadius: lib.layout.borderRadius.large,
					padding: '.4rem 1rem 0px',
					textAlign: 'center',
					verticalAlign: 'center',
					marginBottom: '.4rem',
					backgroundColor: 'transparent',
				}}
			>
				<span
					style={{
						marginLeft: 10,
						fontSize: '20px',
						color: lib.colors.transparentPrimaryColor,
						...lib.layout.presets.font.main.semibold,
					}}
				>
					{t`we call it `}
					<b> dotnugg</b>
				</span>
			</div>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					padding: 10,
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
						gotoLink(`https://github.com/nuggxyz/dotnugg-v1-core`);
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
							fontSize: '20px',
							color: lib.colors.semiTransparentPrimaryColor,
							...lib.layout.presets.font.main.semibold,
						}}
					>
						{t`cop the code`}
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
						gotoEtherscan(DEFAULT_CHAIN, 'address', DEFAULT_CONTRACTS.DotnuggV1);
					}}
				>
					<img
						alt="ethereum logo"
						src={ehterscan_dark}
						height={25}
						style={{
							objectFit: 'cover',
						}}
					/>
					<span
						style={{
							marginLeft: 10,
							fontSize: '20px',
							color: lib.colors.semiTransparentPrimaryColor,
							...lib.layout.presets.font.main.semibold,
						}}
					>
						{t`read the contract`}
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
						gotoLink(
							`https://marketplace.visualstudio.com/items?itemName=nuggxyz.dotnugg&ssr=false#overview`,
						);
					}}
				>
					<img
						alt="ethereum logo"
						src={vscode}
						height={25}
						style={{
							objectFit: 'cover',
						}}
					/>
					<span
						style={{
							marginLeft: 10,
							fontSize: '20px',
							color: lib.colors.semiTransparentPrimaryColor,
							...lib.layout.presets.font.main.semibold,
						}}
					>
						{t`build something`}
					</span>
				</div>
			</div>
			{screen !== 'phone' && (
				<packages.spring.animated.div
					className="mobile-pressable-div"
					style={{
						alignItems: 'center',
						display: 'flex',
						flexDirection: 'column',
						// padding: 10,
						color: lib.colors.white,
						boxShadow: lib.layout.boxShadow.basic,
						padding: '.7rem 1.3rem',
						background: lib.colors.gradient3,
						borderRadius: lib.layout.borderRadius.large,
						marginBottom: 15,
						zIndex: 300,
						...spring4,
					}}
					role="button"
					aria-hidden="true"
					onClick={() => {
						setPage(Page.Tldr_2);
					}}
				>
					<span style={{ ...lib.layout.presets.font.main.thicc }}>{t`next`}</span>
				</packages.spring.animated.div>
			)}
		</div>
	);
};

export default Welcome_0;
