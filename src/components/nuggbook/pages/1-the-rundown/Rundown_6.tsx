import React from 'react';
import { t } from '@lingui/macro';

import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import Text from '@src/components/general/Texts/Text/Text';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';

import styles from './Rundown.styles';

const Rundown_6: NuggBookPage = ({ setPage }) => {
	return (
		<div>
			<Text size="largest" textStyle={styles.title}>{t`the nugg pool pt.2`}</Text>
			<div>
				<Text
					textStyle={styles.text}
				>{t`Naturally, as periods pass by and auctions end, the pool will increase in value and so each share will always increase in value as well`}</Text>
				<Text
					textStyle={styles.text}
				>{t`We've made it mathematically impossible for the share to decrease in value, so the longer your nugg belongs to you, the more benefits you will earn`}</Text>
			</div>
			<div style={styles.buttonContainer}>
				<Button
					className="mobile-pressable-div"
					label={t`what can I do with a nugg? 💎`}
					onClick={() => {
						setPage(Page.Rundown_7, true);
					}}
					size="large"
					buttonStyle={styles.actionButton}
					textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
				/>
				<NuggBookBackButton page={Page.Rundown_5} />
			</div>
		</div>
	);
};

export default Rundown_6;
