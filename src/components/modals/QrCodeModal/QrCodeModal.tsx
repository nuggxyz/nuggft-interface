import React, { useEffect } from 'react';
import QRCode from 'qrcode.react';
import { t } from '@lingui/macro';
import { IoIosArrowDropleftCircle } from 'react-icons/io';

import Text from '@src/components/general/Texts/Text/Text';
import NLStaticImage from '@src/components/general/NLStaticImage';
import lib, { isUndefinedOrNullOrObjectEmpty } from '@src/lib';
import { QRCodeModalData } from '@src/interfaces/modals';
import useDimensions from '@src/client/hooks/useDimensions';
import web3 from '@src/web3';
import client from '@src/client';
import Button from '@src/components/general/Buttons/Button/Button';

import styles from './QrCodeModal.styles';

const QrCodeModal = ({ data }: { data: QRCodeModalData }) => {
	const [, isPhone] = useDimensions();
	const address = web3.hook.usePriorityAccount();
	const closeModal = client.modal.useCloseModal();
	useEffect(() => {
		if (address) {
			closeModal();
		}
	}, [address, closeModal]);
	const openModal = client.modal.useOpenModal();
	const check = web3.hook.usePriorityPeer();
	React.useEffect(() => {
		if (check === data.info) {
			closeModal();
		}
	}, [check, data, closeModal]);
	return (
		<div style={styles.container}>
			<div style={styles.textContainer}>
				<Text size="larger" textStyle={{ color: lib.colors.primaryColor }}>
					{t`Sign in with ${data.info.name}`}
				</Text>
				<NLStaticImage image={`${data.info.peer}_icon`} style={{ marginLeft: '1rem' }} />
			</div>
			<div>
				<QRCode
					value={data.uri || ''}
					size={isPhone ? 200 : 400}
					level="L"
					// fgColor={data.backgroundStyle.background}
					bgColor={lib.colors.transparent}
					// bgColor={lib.colors.background}
				/>
			</div>
			<Button
				buttonStyle={{
					backgroundColor: lib.colors.transparentWhite,
					color: lib.colors.primaryColor,
					borderRadius: lib.layout.borderRadius.large,
					marginBottom: '.4rem',
					// width: '13rem',
					alignItems: 'center',
					position: 'absolute',
					top: '1rem',
					left: '1rem',
				}}
				label="back"
				leftIcon={
					<IoIosArrowDropleftCircle
						color={lib.colors.primaryColor}
						style={{ marginRight: '.3rem' }}
						size={20}
					/>
				}
				onClick={() => {
					if (
						!isUndefinedOrNullOrObjectEmpty(data) &&
						!isUndefinedOrNullOrObjectEmpty(data.previousModal)
					) {
						openModal(data.previousModal);
					}
				}}
			/>
		</div>
	);
};

export default QrCodeModal;
