import React, { FunctionComponent } from 'react';

import web3 from '@src/web3';
import client from '@src/client';
import List from '@src/components/general/List/List';

import ClaimRenderItem from './ClaimRenderItem';
import MultiClaimButton from './MultiClaimButton';
import styles from './ClaimTab.styles';

type Props = Record<string, never>;

const ClaimTab: FunctionComponent<Props> = () => {
    const sender = web3.hook.usePriorityAccount();
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    const unclaimedOffers = client.live.myUnclaimedOffers();

    return sender && chainId && provider ? (
        <div style={styles.container}>
            <List
                data={unclaimedOffers}
                RenderItem={ClaimRenderItem}
                TitleButton={MultiClaimButton}
                label="Claims"
                labelStyle={styles.listLabel}
                listEmptyStyle={styles.textWhite}
                loaderColor="white"
                style={styles.list}
                extraData={{ sender, chainId, provider }}
                listEmptyText="No Nuggs or ETH to claim..."
                // itemHeight={75.1875}
            />
        </div>
    ) : null;
};

export default React.memo(ClaimTab);
