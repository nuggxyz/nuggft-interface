import React, { FunctionComponent } from 'react';
import { t } from '@lingui/macro';

import client from '@src/client';
import InfiniteList from '@src/components/general/List/InfiniteList';

import LoanRenderItem from './LoanRenderItem';
import styles from './LoanTab.styles';
import MultiLoanButton from './MultiLoanButton';
import MultiRebalanceButton from './MultiRebalanceButton';
import Flyout from '@src/components/general/Flyout/Flyout';
import { IoEllipsisVertical } from 'react-icons/io5';
import lib from '@src/lib';
import useDimensions from '@src/client/hooks/useDimensions';

type Props = Record<string, never>;

const Buttons = () => {
	const [screen] = useDimensions();
	return (
		<Flyout
			openOnHover={screen === 'desktop'}
			float="right"
			containerStyle={{ position: 'relative' }}
			style={{ right: '0px', width: '130px' }}
			top={30}
			button={
				<div
					style={{
						background: lib.colors.white,
						borderRadius: lib.layout.borderRadius.large,
						padding: '.4rem .4rem 0rem .4rem',
					}}
				>
					<IoEllipsisVertical color={lib.colors.nuggRedText} />
				</div>
			}
		>
			<MultiRebalanceButton />
			<MultiLoanButton />
		</Flyout>
	);
};

const LoanTab: FunctionComponent<Props> = () => {
	const epoch = client.epoch.active.useId();
	const loanedNuggs = client.user.useLoans();

	return (
		<div style={styles.container}>
			<InfiniteList
				data={loanedNuggs}
				RenderItem={LoanRenderItem}
				TitleButton={Buttons}
				label={t`Loaned Nuggs`}
				style={styles.list}
				extraData={epoch ?? 0}
				listEmptyText={t`This is where you will be able to manage nuggs that you have loaned out`}
				labelStyle={styles.listLabel}
				listEmptyStyle={styles.textWhite}
				loaderColor="white"
				action={() => undefined}
				itemHeight={79.578}
			/>
		</div>
	);
};

export default React.memo(LoanTab);
