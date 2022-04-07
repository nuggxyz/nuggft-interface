import React, { FunctionComponent } from 'react';
import { t } from '@lingui/macro';
import { IoArrowDown, IoSync } from 'react-icons/io5';

import Colors from '@src/lib/colors';
import state from '@src/state';
import Button from '@src/components/general/Buttons/Button/Button';
import web3 from '@src/web3';
import styles from '@src/components/nugg/ViewingNugg/ViewingNugg.styles';

type Props = { tokenId: string; reclaim?: boolean };

const SaleButtons: FunctionComponent<Props> = ({ tokenId, reclaim = false }) => {
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
                label={reclaim ? t`Reclaim` : t`Claim`}
                leftIcon={
                    reclaim ? (
                        <IoSync
                            color={Colors.nuggBlueText}
                            size={25}
                            style={{ marginRight: '.75rem' }}
                        />
                    ) : (
                        <IoArrowDown
                            color={Colors.nuggBlueText}
                            size={25}
                            style={{ marginRight: '.75rem' }}
                        />
                    )
                }
                onClick={() =>
                    state.wallet.dispatch.claim({
                        tokenId,
                        sender,
                        provider,
                        chainId,
                    })
                }
            />
        </div>
    ) : null;
};

export default SaleButtons;
