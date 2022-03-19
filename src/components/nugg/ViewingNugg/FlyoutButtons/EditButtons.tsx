import React from 'react';
import { IoSync } from 'react-icons/io5';

import Colors from '@src/lib/colors';
import Button from '@src/components/general/Buttons/Button/Button';
import web3 from '@src/web3';
import styles from '@src/components/nugg/ViewingNugg/ViewingNugg.styles';
import client from '@src/client';

type Props = { tokenId: string };

export default ({ tokenId }: Props) => {
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const sender = web3.hook.usePriorityAccount();
    return sender && provider && chainId ? (
        <div style={styles.ownerButtonContainer}>
            <Button
                textStyle={styles.textBlack}
                size="medium"
                type="text"
                buttonStyle={styles.button}
                label="Edit"
                leftIcon={
                    <IoSync
                        color={Colors.nuggBlueText}
                        size={25}
                        style={{ marginRight: '.75rem' }}
                    />
                }
                onClick={() =>
                    client.actions.updateProtocol({
                        editingNugg: tokenId,
                    })
                }
            />
        </div>
    ) : null;
};
