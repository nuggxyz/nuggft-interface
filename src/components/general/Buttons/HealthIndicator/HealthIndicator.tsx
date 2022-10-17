import React from 'react';
import { animated } from '@react-spring/web';
import { IoSyncCircle } from 'react-icons/io5';

import Text from '@src/components/general/Texts/Text/Text';
import lib from '@src/lib';
import client from '@src/client';
import Flyout from '@src/components/general/Flyout/Flyout';
import useInterval from '@src/hooks/useInterval';

import graph from '@src/assets/images/app_logos/graph.png';
import etherscan from '@src/assets/images/app_logos/etherscan.png';
import eth from '@src/assets/images/app_logos/eth.png';
import { t } from '@lingui/macro';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';

const DisplayOk = () => {
	// const rotate = useSpring({
	//     loop: true,
	//     // delay: 3000,
	//     config: springConfig.molasses,
	//     from: { rotateZ: 0 },
	//     to: { rotateZ: 180 },
	// });

	return (
		<animated.div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				// width: 30,
				// height: 30,
				// background: 'white',
				// borderRadius: lib.layout.borderRadius.large,
				animation: `Rotate 2s ${lib.layout.animation} infinite`,
			}}
		>
			<IoSyncCircle color={lib.colors.nuggGreenSemiTransparent} size={45} />
		</animated.div>
	);
};

const DisplayProblem = () => {
	return (
		<animated.div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				// ...rotate,
			}}
		>
			<IoSyncCircle color={lib.colors.red} size={45} />
		</animated.div>
	);
};

const Status = () => {
	const lastGraphBlock = client.health.useLastGraphBlock();
	const lastRpcBlock = client.block.useBlock();
	const lastRpcChange = client.block.useLastChange();

	const lastGraphBlockTimestamp = client.health.useLastGraphBlockTimestamp();
	const isOpen = client.nuggbook.useOpen();

	const lastTimestamp = client.usd.useTimestamp();
	const lastPrice = client.usd.useUsd();
	const graphProblem = client.health.useHealth();
	const [secondsSinceGraphResponse, setSecondsSinceGraphResponse] = React.useState(0);
	const [secondsSinceRpcResponse, setSecondsSinceRpcResponse] = React.useState(0);
	const [secondsSinceEtherscanResponse, setSecondsSinceEtherscanResponse] = React.useState(0);

	useInterval(
		React.useCallback(() => {
			const now = Math.floor(new Date().getTime() / 1000);
			setSecondsSinceGraphResponse(Math.ceil(now - lastGraphBlockTimestamp / 1000));
			setSecondsSinceRpcResponse(now - Math.floor(lastRpcChange / 1000));
			setSecondsSinceEtherscanResponse(now - Math.floor(lastTimestamp));
		}, [isOpen, lastGraphBlockTimestamp, lastRpcChange, lastTimestamp]),
		1000,
	);

	return (
		<div
			style={{
				width: '20rem',
				height: '100%',
				overflow: 'scroll',
				padding: 10,
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<div
				style={{
					// marginTop: '20px',
					display: 'flex',
					justifyContent: 'space-between',
					background: lib.colors.transparentWhite,
					padding: 15,
					borderRadius: lib.layout.borderRadius.mediumish,
					boxShadow: lib.layout.boxShadow.basic,
				}}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						flexDirection: 'column',
						alignItems: 'center',
						height: '100%',
						background: lib.colors.primaryColor,
						padding: 10,
						borderRadius: lib.layout.borderRadius.mediumish,
					}}
				>
					<img
						alt="ethereum logo"
						src={eth}
						height={50}
						style={{
							objectFit: 'cover',
						}}
					/>
					<Text
						textStyle={{
							fontWeight: lib.layout.fontWeight.thicc,
							color: lib.colors.white,
						}}
					>
						ethereum
					</Text>
				</div>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						flexDirection: 'column',
						alignItems: 'flex-end',
						height: '100%',
					}}
				>
					<Text textStyle={{ color: lib.colors.primaryColor, fontSize: 14 }}>
						{t`last block`}
					</Text>
					<Text
						textStyle={{
							color: lib.colors.primaryColor,
							fontWeight: lib.layout.fontWeight.thicc,
							fontFamily: lib.layout.fontFamily.monospace,
							marginBottom: 5,
						}}
					>
						{lastRpcBlock}
					</Text>

					<Text textStyle={{ color: lib.colors.primaryColor, fontSize: 14 }}>
						{t`last response`}
					</Text>
					<Text
						textStyle={{
							color: lib.colors.primaryColor,
							fontWeight: lib.layout.fontWeight.thicc,
							fontFamily: lib.layout.fontFamily.monospace,
						}}
					>
						{secondsSinceRpcResponse} sec ago
					</Text>
				</div>
			</div>
			<div
				style={{
					// marginTop: '20px',
					display: 'flex',
					justifyContent: 'space-between',
					background: graphProblem
						? lib.colors.gradientTransparent
						: lib.colors.transparentWhite,
					padding: 15,
					marginTop: 15,
					borderRadius: lib.layout.borderRadius.mediumish,
					boxShadow: lib.layout.boxShadow.basic,
				}}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						flexDirection: 'column',
						alignItems: 'center',
						height: '100%',
						background: lib.colors.primaryColor,
						padding: 10,
						borderRadius: lib.layout.borderRadius.mediumish,
						position: 'relative',
					}}
				>
					<img
						alt="graph protocol logo"
						src={graph}
						height={50}
						style={{
							borderRadius: '22.5%',
							objectFit: 'cover',
						}}
					/>
					<Text
						textStyle={{
							fontWeight: lib.layout.fontWeight.thicc,
							color: lib.colors.white,
						}}
					>
						the graph
					</Text>
				</div>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						flexDirection: 'column',
						alignItems: 'flex-end',
						height: '100%',
					}}
				>
					<Text
						textStyle={{
							color: lib.colors.primaryColor,
							fontSize: 14,
						}}
					>
						{t`last block`}
					</Text>
					<Text
						textStyle={{
							color: lib.colors.primaryColor,
							fontWeight: lib.layout.fontWeight.thicc,
							fontFamily: lib.layout.fontFamily.monospace,
							marginBottom: 5,
							display: 'flex',
							alignItems: 'center',
						}}
					>
						{lastGraphBlock}
					</Text>

					<Text textStyle={{ color: lib.colors.primaryColor, fontSize: 14 }}>
						{t`last updated`}
					</Text>
					{lastGraphBlock !== 0 ? (
						<Text
							textStyle={{
								color: lib.colors.primaryColor,
								fontWeight: lib.layout.fontWeight.thicc,
								fontFamily: lib.layout.fontFamily.monospace,
							}}
						>
							{secondsSinceGraphResponse} sec ago
						</Text>
					) : (
						<Text
							textStyle={{
								color: lib.colors.primaryColor,

								fontWeight: lib.layout.fontWeight.normal,
								fontFamily: lib.layout.fontFamily.monospace,
							}}
						>
							[no response]
						</Text>
					)}
				</div>
			</div>

			<div
				style={{
					// marginTop: '20px',
					display: 'flex',
					justifyContent: 'space-between',
					background: lib.colors.transparentWhite,
					padding: 15,
					marginTop: 15,
					borderRadius: lib.layout.borderRadius.mediumish,
					boxShadow: lib.layout.boxShadow.basic,
				}}
			>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						flexDirection: 'column',
						alignItems: 'center',
						height: '100%',
						background: lib.colors.primaryColor,
						padding: 10,
						borderRadius: lib.layout.borderRadius.mediumish,
					}}
				>
					<img
						alt="etherscan logo"
						src={etherscan}
						height={50}
						style={{
							borderRadius: '22.5%',
							objectFit: 'cover',
						}}
					/>
					<Text
						textStyle={{
							fontWeight: lib.layout.fontWeight.thicc,
							color: lib.colors.white,
						}}
					>
						etherscan
					</Text>
				</div>

				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						flexDirection: 'column',
						alignItems: 'flex-end',
						height: '100%',
					}}
				>
					<Text textStyle={{ color: lib.colors.primaryColor, fontSize: 14 }}>
						{t`last eth price`}
					</Text>
					<CurrencyText
						textStyle={{
							color: lib.colors.primaryColor,
							fontWeight: lib.layout.fontWeight.thicc,
							fontFamily: lib.layout.fontFamily.monospace,
							marginBottom: 5,
						}}
						full
						unitOverride="USD"
						value={lastPrice}
					/>

					<Text textStyle={{ color: lib.colors.primaryColor, fontSize: 14 }}>
						{t`last updated`}
					</Text>
					<Text
						textStyle={{
							color: lib.colors.primaryColor,
							fontWeight: lib.layout.fontWeight.thicc,
							fontFamily: lib.layout.fontFamily.monospace,
						}}
					>
						{secondsSinceEtherscanResponse} sec ago
					</Text>
				</div>
			</div>
		</div>
	);
};

export default () => {
	const graphProblem = client.health.useHealth();

	return (
		<Flyout openOnHover button={!graphProblem ? <DisplayOk /> : <DisplayProblem />} top={50}>
			<Status />
		</Flyout>
	);
};
