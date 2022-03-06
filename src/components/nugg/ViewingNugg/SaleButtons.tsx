import React, { FunctionComponent } from 'react';
import { IoSync } from 'react-icons/io5';

import Colors from '@src/lib/colors';
import state from '@src/state';
import Button from '@src/components/general/Buttons/Button/Button';
import web3 from '@src/web3';

import styles from './ViewingNugg.styles';

type Props = { tokenId: string };

const SaleButtons: FunctionComponent<Props> = ({ tokenId }) => {
    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();
    const address = web3.hook.usePriorityAccount();
    return (
        <div style={styles.ownerButtonContainer}>
            <Button
                textStyle={styles.textBlack}
                size="medium"
                type="text"
                buttonStyle={styles.button}
                label="Reclaim"
                leftIcon={
                    <IoSync
                        color={Colors.nuggBlueText}
                        size={25}
                        style={{ marginRight: '.75rem' }}
                    />
                }
                onClick={() =>
                    state.wallet.dispatch.claim({
                        tokenId: tokenId,
                        senderAddress: address,
                        provider,
                        chainId,
                    })
                }
            />
        </div>
    );
};

export default SaleButtons;
