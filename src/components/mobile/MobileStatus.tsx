import React from 'react';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import eth from '@src/assets/images/app_logos/eth.png';
import client from '@src/client';
import useInterval from '@src/hooks/useInterval';
import Text from '@src/components/general/Texts/Text/Text';
import graph from '@src/assets/images/app_logos/graph.png';
import etherscan from '@src/assets/images/app_logos/etherscan.png';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import useMountLogger from '@src/hooks/useMountLogger';

export default () => {
	// const lastGraphResponse = client.health.useLastGraphResponse();
	const lastGraphBlock = client.health.useLastGraphBlock();
	const lastRpcBlock = client.block.useBlock();
	const lastRpcChange = client.block.useLastChange();

	// const graphProblem = client.health.useHealth();
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
			if (isOpen) {
				const now = Math.floor(new Date().getTime() / 1000);
				setSecondsSinceGraphResponse(Math.ceil(now - lastGraphBlockTimestamp / 1000));
				setSecondsSinceRpcResponse(now - Math.floor(lastRpcChange / 1000));
				setSecondsSinceEtherscanResponse(now - Math.floor(lastTimestamp));
			}
		}, [isOpen, lastGraphBlockTimestamp, lastRpcChange, lastTimestamp]),
		1000,
	);

	useMountLogger('MobileStatus');

	return (
		<div
			style={{
				width: '100%',
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
					{/* {graphProblem && (
                        <Text
                            size="smaller"
                            textStyle={{
                                padding: '5px 10px',
                                background: lib.colors.gradientTransparent,
                                borderRadius: lib.layout.borderRadius.medium,
                                right: -75,
                                top: 0,
                                textAlign: 'center',
                                position: 'absolute',
                            }}
                        >
                            <strong>
                                {Math.floor(
                                    (new Date().getTime() - lastGraphBlockTimestamp) / 60 / 1000,
                                )}{' '}
                                min
                            </strong>
                            <br /> ago
                        </Text>
                    )} */}
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
