import React from 'react';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import NuggBookBackButton from '@src/components/nuggbook/NuggBookBackButton';
import BulletPoint from '@src/components/nuggbook/BulletPoint';

import styles from './Rundown.styles';

const Rundown_9: NuggBookPage = ({ setPage }) => {
	return (
		<div>
			<Text size="largest" textStyle={styles.title}>{t`2️⃣ loaning your nugg`}</Text>
			<div>
				<Text
					textStyle={styles.text}
				>{t`When you loan your nugg, you receive the value of the current share price`}</Text>
				<Text
					textStyle={styles.text}
				>{t`Your nugg will be used as collateral for 200 periods (approx. 200 hours). Anytime during the duration of the loan you can either extend or pay off the loan:`}</Text>
				<div style={{ marginLeft: '.5rem' }}>
					<BulletPoint
						text={t`to extend the loan you must pay the amount the share price increased since you took out the loan`}
					/>
					<BulletPoint
						text={t`to pay off the loan, you pay the same amount as you would to extend it, as well as the original value of the loan and a small fee`}
					/>
					<BulletPoint
						text={t`if you let your loan expire, your nugg will be put up for sale and the winnings will all be sent to the pool`}
					/>
				</div>
				<Text
					textStyle={styles.text}
				>{t`While your nugg is loaned, the only thing that you cannot do is sell it. It can still be edited and it still counts as a share of the pool `}</Text>
			</div>
			<div style={styles.buttonContainer}>
				<Button
					className="mobile-pressable-div"
					label={t`what part of the nugg can I edit?`}
					onClick={() => {
						setPage(Page.Rundown_10, true);
					}}
					size="large"
					buttonStyle={styles.actionButton}
					textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
				/>
				<NuggBookBackButton page={Page.Rundown_8} />
			</div>
		</div>
	);
};

export default Rundown_9;
