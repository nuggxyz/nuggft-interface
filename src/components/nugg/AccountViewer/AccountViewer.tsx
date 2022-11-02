import React from 'react';
import { t } from '@lingui/macro';
import { FiAtSign } from 'react-icons/fi';

import Jazzicon from '@src/components/nugg/Jazzicon';
import Text from '@src/components/general/Texts/Text/Text';
import web3 from '@src/web3';
import Flyout from '@src/components/general/Flyout/Flyout';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import globalStyles from '@src/lib/globalStyles';
import { useDarkMode } from '@src/client/hooks/useDarkMode';
import CurrencyToggler from '@src/components/general/Buttons/CurrencyToggler/CurrencyToggler';
import client from '@src/client';
import { ModalEnum } from '@src/interfaces/modals';
import ens_icon from '@src/assets/images/app_logos/ens.png';

import styles from './AccountViewer.styles';
import useDimensions from '@src/client/hooks/useDimensions';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';

const AccountViewer = () => {
	const chainId = web3.hook.usePriorityChainId();
	const provider = web3.hook.usePriorityProvider();
	const address = web3.hook.usePriorityAccount();
	const [ens, ensValid] = client.ens.useEnsWithValidity(provider, address);
	const balance = web3.hook.usePriorityBalance(provider);
	const peer = web3.hook.usePriorityPeer();
	const connector = web3.hook.usePriorityConnector();
	const openModal = client.modal.useOpenModal();
	const [screen] = useDimensions();

	const currencyPref = client.usd.useCurrencyPreferrence();
	const setCurrencyPref = client.usd.useSetCurrencyPreferrence();

	const preferenceValue = client.usd.useUsdPair(balance);

	const darkmode = useDarkMode();

	return !address ? (
		<div
			style={{
				background: lib.colors.shadowLightGrey,
				height: '35px',
				width: '35px',
				borderRadius: 100,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				boxShadow: lib.layout.boxShadow.basic,
			}}
		>
			<Button
				buttonStyle={{ background: lib.colors.transparent, padding: '.5rem .3rem' }}
				onClick={() =>
					openModal({
						modalType: ModalEnum.Wallet,
						containerStyle: { background: lib.colors.transparentWhite },
					})
				}
				rightIcon={<FiAtSign style={{ color: lib.colors.darkerGray }} />}
			/>
		</div>
	) : ens && chainId && peer ? (
		<Flyout
			style={styles.flyout}
			triggerWidth="175px"
			openOnHover={screen === 'desktop'}
			top={50}
			button={
				<div style={styles.textContainer}>
					<Jazzicon
						address={address}
						size={15}
						style={{ margin: '.25rem .5rem .25rem .25rem' }}
					/>
					<Text type="text" size="medium" textStyle={styles.text}>
						{ens.toLowerCase()}
					</Text>
				</div>
			}
		>
			<>
				<div style={{ padding: '.5rem .75rem', ...globalStyles.centeredSpaceBetween }}>
					<Text
						type="title"
						size="small"
						textStyle={{
							...styles.balance,
							...(darkmode ? { color: 'white' } : {}),
						}}
					>
						Balance
					</Text>
					<CurrencyText
						textStyle={{ color: darkmode ? lib.colors.white : lib.colors.primaryColor }}
						type="text"
						size="smaller"
						image="eth"
						value={preferenceValue}
					/>
				</div>
				<div
					style={{
						width: '100%',
						...globalStyles.centered,
						padding: '.5rem 0rem',
						borderBottom: `1px solid ${lib.colors.transparentLightGrey}`,
						borderTop: `1px solid ${lib.colors.transparentLightGrey}`,
					}}
				>
					<CurrencyToggler
						pref={currencyPref}
						setPref={setCurrencyPref}
						floaterStyle={{ background: lib.colors.nuggBlueTransparent }}
					/>
				</div>
				<Button
					className="mobile-pressable-div-shallow"
					type="text"
					label={!ensValid ? t`Pick username` : t`Edit username`}
					onClick={() => {
						openModal({ modalType: ModalEnum.Name as const });
					}}
					hoverStyle={{ background: lib.colors.nuggBlueTransparent }}
					// buttonStyle={{
					// 	borderRadius: lib.layout.borderRadius.medium,
					// 	background: !ensValid
					// 		? lib.colors.nuggRedText
					// 		: lib.colors.transparentWhite,
					// 	padding: '10px 10px',
					// 	alignItems: 'center',
					// 	boxShadow: lib.layout.boxShadow.basic,
					// 	WebkitBackdropFilter: 'blur(50px)',
					// 	backdropFilter: 'blur(50px)',
					// }}
					leftIcon={
						ensValid ? (
							<img
								alt="ens logo"
								src={ens_icon}
								height={20}
								style={{
									borderRadius: lib.layout.borderRadius.small,
									objectFit: 'cover',
									marginRight: '.75rem',
								}}
							/>
						) : (
							<span style={{ fontSize: 20, marginRight: '.75rem' }}>⚠️</span>
						)
					}
					buttonStyle={{
						...styles.flyoutButton,
						height: '50.79px',
					}}
					textStyle={{
						color: !ensValid ? lib.colors.white : lib.colors.primaryColor,
					}}
				/>
				<Button
					className="mobile-pressable-div-shallow"
					label={t`Explore`}
					type="text"
					buttonStyle={styles.flyoutButton}
					hoverStyle={{ background: lib.colors.nuggBlueTransparent }}
					leftIcon={
						<Text size="large" textStyle={{ marginRight: '.75rem' }}>
							🔭
						</Text>
					}
					onClick={() => web3.config.gotoEtherscan(chainId, 'address', address)}
				/>
				<Button
					className="mobile-pressable-div-shallow"
					type="text"
					label={t`Peace out`}
					buttonStyle={styles.flyoutButton}
					hoverStyle={{ background: lib.colors.nuggBlueTransparent }}
					leftIcon={
						<Text size="large" textStyle={{ marginRight: '.75rem' }}>
							✌️
						</Text>
					}
					onClick={() => {
						void connector.deactivate();
					}}
				/>
			</>
		</Flyout>
	) : null;
};

export default React.memo(AccountViewer);
