import React, { FunctionComponent } from 'react';

import NLStaticImage from '@src/components/general/NLStaticImage';
import web3 from '@src/web3';
import InteractiveText from '@src/components/general/Texts/InteractiveText/InteractiveText';
import Button from '@src/components/general/Buttons/Button/Button';
import state from '@src/state';

type Props = Record<string, never>;

const Connection: FunctionComponent<Props> = () => {
    const connector = web3.hook.usePriorityConnector();

    const chainId = web3.hook.usePriorityChainId();
    const provider = web3.hook.usePriorityProvider();

    const ens = web3.hook.usePriorityENSName(provider);
    const address = web3.hook.usePriorityAccount();
    const isActive = web3.hook.usePriorityIsActive();

    const peer = web3.hook.usePriorityPeer();

    return isActive && ens && chainId && peer && address ? (
        <div
            style={{
                padding: '.25rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                width: '100%',
            }}
        >
            <NLStaticImage image={`${peer.peer}_icon`} />

            <InteractiveText action={() => web3.config.gotoEtherscan(chainId, 'address', address)}>
                {ens}
            </InteractiveText>

            <Button
                label="Disconnect"
                onClick={() => {
                    void connector.deactivate();
                    state.app.dispatch.toggleWalletManager();
                }}
            />
        </div>
    ) : null;
};

export default Connection;
