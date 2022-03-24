import React, { FunctionComponent } from 'react';
import { t } from '@lingui/macro';

import client from '@src/client';
import InfiniteList from '@src/components/general/List/InfiniteList';

import LoanRenderItem from './LoanRenderItem';
import styles from './LoanTab.styles';
import MultiLoanButton from './MultiLoanButton';
import MultiRebalanceButton from './MultiRebalanceButton';

type Props = Record<string, never>;

const Buttons = () => (
    <>
        <MultiRebalanceButton />
        <MultiLoanButton />
    </>
);

const LoanTab: FunctionComponent<Props> = () => {
    const epochId = client.live.epoch.id();
    const loanedNuggs = client.live.myLoans();

    return (
        <div style={styles.container}>
            <InfiniteList
                data={loanedNuggs}
                RenderItem={LoanRenderItem}
                TitleButton={Buttons}
                label={t`Loaned Nuggs`}
                style={styles.list}
                extraData={epochId}
                listEmptyText={t`You haven't loaned any nuggs yet!`}
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
