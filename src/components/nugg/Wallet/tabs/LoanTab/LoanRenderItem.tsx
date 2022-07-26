import React, { FunctionComponent } from 'react';
import { t } from '@lingui/macro';

import { LoanData } from '@src/client/interfaces';
import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import globalStyles from '@src/lib/globalStyles';
import TokenViewer from '@src/components/nugg/TokenViewer';
import { InfiniteListRenderItemProps } from '@src/components/general/List/InfiniteList';
import client from '@src/client';
import { ModalEnum } from '@src/interfaces/modals';
import lib from '@src/lib';

import styles from './LoanTab.styles';

const LoanRenderItem: FunctionComponent<
	InfiniteListRenderItemProps<LoanData, number | undefined, undefined>
> = ({ item, index, extraData: epochId }) => {
	const openModal = client.modal.useOpenModal();

	return item ? (
		<div key={index} style={styles.renderItemContainer}>
			<div style={globalStyles.centered}>
				<TokenViewer tokenId={item.nugg} style={styles.renderItemNugg} />
				<div style={{ textAlign: 'left', marginLeft: '.5rem' }}>
					<Text textStyle={styles.textBlue} size="small">
						Nugg {item.nugg.toRawId()}
					</Text>
					<Text type="text" textStyle={styles.textDefault} size="smaller">
						{epochId && `${+item.endingEpoch - +epochId} epochs remaining`}
					</Text>
				</div>
			</div>
			<div>
				<Button
					textStyle={styles.textWhite}
					type="text"
					size="small"
					buttonStyle={{
						...styles.renderItemButton,
						marginBottom: '.3rem',
					}}
					label={t`Extend`}
					onClick={() =>
						openModal({
							modalType: ModalEnum.LoanInput,
							tokenId: item.nugg,
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
					textStyle={styles.textWhite}
					type="text"
					size="small"
					buttonStyle={styles.renderItemButton}
					label={t`Pay off`}
					onClick={() =>
						openModal({
							modalType: ModalEnum.LoanInput,
							tokenId: item.nugg,
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
			</div>
		</div>
	) : null;
};

export default LoanRenderItem;
