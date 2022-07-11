import React, { FunctionComponent } from 'react';
import { IoHourglassOutline, IoPencil, IoPricetagOutline } from 'react-icons/io5';
import { t } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';

import Button from '@src/components/general/Buttons/Button/Button';
import styles from '@src/components/nugg/ViewingNugg/ViewingNugg.styles';
import client from '@src/client';
import { ModalEnum } from '@src/interfaces/modals';
import lib from '@src/lib';
import Label from '@src/components/general/Label/Label';

type Props = { tokenId: NuggId };

const LoanButtons: FunctionComponent<Props> = ({ tokenId }) => {
	const navigate = useNavigate();
	const openModal = client.modal.useOpenModal();

	return (
		<div style={{ ...styles.ownerButtonContainer, flexDirection: 'column' }}>
			<Label leftDotColor={lib.colors.green} text={t`Loaned`} />
			<div style={styles.ownerButtonContainer}>
				<Button
					className="mobile-pressable-div"
					textStyle={styles.textBlack}
					size="medium"
					type="text"
					buttonStyle={styles.button}
					label={t`Extend`}
					leftIcon={
						<IoHourglassOutline
							color={lib.colors.nuggBlueText}
							size={25}
							// style={{ marginRight: '.75rem' }}
						/>
					}
					onClick={() =>
						openModal({
							modalType: ModalEnum.LoanInput,
							tokenId,
							actionType: 'rebalance',
							backgroundStyle: {
								background: lib.colors.gradient2Transparent,
							},
							containerStyle: {
								background: lib.colors.semiTransparentWhite,
							},
						})
					}
				/>
				<Button
					className="mobile-pressable-div"
					textStyle={styles.textBlack}
					size="medium"
					type="text"
					buttonStyle={styles.button}
					label={t`Pay off`}
					leftIcon={
						<IoPricetagOutline
							color={lib.colors.nuggBlueText}
							size={25}
							// style={{ marginRight: '.75rem' }}
						/>
					}
					onClick={() =>
						openModal({
							modalType: ModalEnum.LoanInput,
							tokenId,
							actionType: 'liquidate',
							backgroundStyle: {
								background: lib.colors.gradient2Transparent,
							},
							containerStyle: {
								background: lib.colors.semiTransparentWhite,
							},
						})
					}
				/>
				<Button
					className="mobile-pressable-div"
					textStyle={styles.textBlack}
					size="medium"
					type="text"
					buttonStyle={styles.button}
					label={t`Edit`}
					leftIcon={
						<IoPencil
							color={lib.colors.nuggBlueText}
							size={25}
							// style={{ marginRight: '.75rem' }}
						/>
					}
					onClick={() => navigate(`/edit/${tokenId}`)}
				/>
			</div>
		</div>
	);
};

export default LoanButtons;
