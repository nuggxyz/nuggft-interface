import React, { FunctionComponent } from 'react';
import { IoCashOutline, IoPencil, IoPricetagsOutline } from 'react-icons/io5';
import { t } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';

import Button from '@src/components/general/Buttons/Button/Button';
import styles from '@src/components/nugg/ViewingNugg/ViewingNugg.styles';
import client from '@src/client';
import { ModalEnum } from '@src/interfaces/modals';
import { buildTokenIdFactory } from '@src/prototypes';
import lib from '@src/lib';

type Props = { tokenId: NuggId };

const OwnerButtons: FunctionComponent<Props> = ({ tokenId }) => {
	const navigate = useNavigate();
	const openModal = client.modal.useOpenModal();

	return (
		<div style={styles.ownerButtonContainer}>
			<Button
				className="mobile-pressable-div"
				textStyle={styles.textBlack}
				size="medium"
				type="text"
				buttonStyle={styles.button}
				label={t`Sell`}
				leftIcon={
					<IoPricetagsOutline
						color={lib.colors.nuggBlueText}
						size={25}
						// style={{ marginRight: '.75rem' }}
					/>
				}
				onClick={() => {
					openModal({
						...buildTokenIdFactory({
							modalType: ModalEnum.Sell as const,
							tokenId,
							sellingNuggId: null,
						}),
						containerStyle: {
							background: lib.colors.semiTransparentWhite,
						},
					});
				}}
			/>
			<Button
				className="mobile-pressable-div"
				textStyle={styles.textBlack}
				size="medium"
				type="text"
				buttonStyle={styles.button}
				label={t`Loan`}
				leftIcon={
					<IoCashOutline
						color={lib.colors.nuggBlueText}
						size={25}
						// style={{ marginRight: '.75rem' }}
					/>
				}
				onClick={() => {
					openModal({
						modalType: ModalEnum.Loan,
						tokenId,
						actionType: 'loan',
						containerStyle: {
							background: lib.colors.semiTransparentWhite,
						},
					});
				}}
			/>
			{/* <Button
                textStyle={styles.textBlack}
                size="medium"
                type="text"
                buttonStyle={styles.button}
                label={t`Burn`}
                leftIcon={
                    <IoTrashBinOutline
                        color={lib.colors.nuggRedText}
                        size={25}
                        style={{ marginRight: '.75rem' }}
                    />
                }
                onClick={() =>
                    state.app.dispatch.setModalOpen({
                        name: 'LoanOrBurnModal',
                        modalData: {
                            targetId: tokenId,
                            type: 'BurnNugg',
                            backgroundStyle: {
                                background: lib.colors.gradient3,
                            },
                        },
                    })
                }
            /> */}
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
	);
};

export default OwnerButtons;
