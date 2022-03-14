import React, { FunctionComponent } from 'react';

import List from '@src/components/general/List/List';
import client from '@src/client';

import LoanRenderItem from './LoanRenderItem';
import styles from './LoanTab.styles';

type Props = Record<string, never>;

const LoanTab: FunctionComponent<Props> = () => {
    const epochId = client.live.epoch.id();
    const loanedNuggs = client.live.myLoans();

    return (
        <div style={styles.container}>
            <List
                data={loanedNuggs}
                RenderItem={LoanRenderItem}
                label="Loaned Nuggs"
                style={styles.list}
                extraData={epochId}
                listEmptyText="You haven't loaned any nuggs yet!"
                labelStyle={styles.listLabel}
                listEmptyStyle={styles.textWhite}
                loaderColor="white"
                action={() => undefined}
            />
        </div>
    );
};

export default React.memo(LoanTab);
