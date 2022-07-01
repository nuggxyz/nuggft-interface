import React, { FunctionComponent } from 'react';
import curriedLighten from 'polished/lib/color/lighten';
import { t } from '@lingui/macro';
import { IoChevronDownCircle } from 'react-icons/io5';

import Button from '@src/components/general/Buttons/Button/Button';
import NLStaticImage from '@src/components/general/NLStaticImage';
import Text from '@src/components/general/Texts/Text/Text';
import web3 from '@src/web3';
import useDimensions from '@src/client/hooks/useDimensions';
import lib from '@src/lib';
import client from '@src/client';
import { Page } from '@src/interfaces/nuggbook';

import styles from './ConnectTab.styles';

type Props = Record<string, never>;

const ConnectTab: FunctionComponent<Props> = () => {
	const [, isPhone] = useDimensions();
	const goto = client.nuggbook.useOpenNuggBook();
	const [forceDesktopAction, setForceDesktopAction] = React.useState(false);
	const [showAll, setShowAll] = React.useState(!isPhone);
	return (
		<div
			style={{
				padding: '.25rem',
				display: 'flex',
				justifyContent: 'flex-start',
				alignItems: 'center',
				flexDirection: 'column',
				height: isPhone ? 'auto' : '100%',
				overflow: 'auto',
			}}
		>
			<div
				style={{
					...styles.disclaimerContainer,
					padding: '1rem',

					background: isPhone
						? styles.walletsContainer.background
						: styles.disclaimerContainer.background,
				}}
			>
				<Text type="text" size="smaller" textStyle={{ color: lib.colors.textColor }}>
					{t`By connecting a wallet, you agree to nugg.xyz's Terms of Service and acknowledge
                    that you have read and understood the nuggft Protocol Disclaimer.`}
				</Text>
			</div>

			{isPhone && (
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'flex-start',
						alignItems: 'center',
						marginTop: -15,
						marginBottom: 10,
						borderRadius: lib.layout.borderRadius.mediumish,
						backgroundColor: lib.colors.transparentWhite,
						padding: 15,
						WebkitBackdropFilter: 'blur(50px)',
						backdropFilter: 'blur(50px)',
					}}
				>
					<Text textStyle={{ marginBottom: 5 }} size="small">
						lost?
					</Text>
					<Button
						textStyle={{ color: 'white', fontWeight: lib.layout.fontWeight.thicc }}
						buttonStyle={{
							background: lib.colors.primaryColor,
							borderRadius: lib.layout.borderRadius.large,
							boxShadow: lib.layout.boxShadow.dark,
						}}
						label="we gotchu 😉 ➡️"
						onClick={() => goto(Page.Setup_0, true)}
					/>
				</div>
			)}

			<div
				style={{
					background: lib.colors.transparentWhite,
					borderRadius: lib.layout.borderRadius.medium,
					padding: '10px',
					display: 'flex',
					flexDirection: 'column',
					height: isPhone ? 'auto' : '100%',
					alignItems: 'center',
					width: isPhone ? '90%' : '100%',
					overflow: isPhone ? undefined : 'scroll',
				}}
			>
				{isPhone && (
					<div
						style={{
							display: 'flex',
							flexDirection: 'column',
							width: '100%',
							alignItems: 'center',
							justifyContent: 'start',
						}}
					>
						<Text textStyle={{ padding: 10, fontWeight: lib.layout.fontWeight.thicc }}>
							tap to connect
						</Text>
						{/* <div
                            style={{
                                display: 'flex',
                                width: '100%',
                                justifyContent: 'space-around',
                                padding: 10,
                            }}
                        >
                            <NLStaticImage image={`${Peer.CoinbaseWallet}_icon`} />
                            <NLStaticImage image={`${Peer.MetaMask}_icon`} />
                            <NLStaticImage image={`${Peer.Rainbow}_icon`} />
                        </div> */}
					</div>
				)}
				{Object.values(web3.config.peers).map((peer, ind) =>
					!peer.fallback && (!isPhone || showAll || ind < 2) ? (
						<Button
							className="mobile-pressable-div"
							key={peer.name}
							buttonStyle={{
								...styles.walletButton,
								border: `5px solid ${curriedLighten(0.1)(peer.color)}`,
							}}
							rightIcon={<NLStaticImage image={peer.peer} />}
							// eslint-disable-next-line @typescript-eslint/no-misused-promises
							onClick={async () => {
								const check = web3.config.connector_instances[peer.type];

								if (check) {
									if (check.store.getState().activating)
										await check.connector.deactivate();
									void check.connector.activate(
										undefined,
										peer.peer,
										__DEV__ && forceDesktopAction,
									);
								}
							}}
						/>
					) : null,
				)}

				{!showAll && (
					<Button
						className="mobile-pressable-div"
						buttonStyle={{
							margin: 10,
							backgroundColor: lib.colors.transparentWhite,
							color: lib.colors.primaryColor,
							borderRadius: lib.layout.borderRadius.mediumish,
							WebkitBackdropFilter: 'blur(50px)',
							backdropFilter: 'blur(50px)',
							alignItems: 'center',
						}}
						textStyle={{ ...lib.layout.presets.font.main.thicc }}
						label="show all"
						leftIcon={
							<IoChevronDownCircle
								color={lib.colors.primaryColor}
								style={{ marginRight: '.3rem' }}
								size={20}
							/>
						}
						onClick={() => {
							setShowAll(true);
						}}
					/>
				)}

				{isPhone && __DEV__ && (
					<Button
						label={
							forceDesktopAction
								? `[DEV] QR forced - turn off`
								: `[DEV] QR not forced - turn on`
						}
						buttonStyle={{
							marginTop: '20px',
							background: lib.colors.red,
							color: lib.colors.white,
						}}
						onClick={() => {
							setForceDesktopAction(!forceDesktopAction);
						}}
					/>
				)}
				{/* <HappyTipper tip="wallet-1" /> */}
			</div>
		</div>
	);
};

export default ConnectTab;
