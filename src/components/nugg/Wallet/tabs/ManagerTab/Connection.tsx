import React, { FunctionComponent } from 'react';

import NLStaticImage from '@src/components/general/NLStaticImage';
import web3 from '@src/web3';
import { Connector } from '@src/web3/core/types';
import InteractiveText from '@src/components/general/Texts/InteractiveText/InteractiveText';
import Button from '@src/components/general/Buttons/Button/Button';
import client from '@src/client';
import state from '@src/state';
type Props = {
    connector: Connector;
};

const Connection: FunctionComponent<Props> = ({ connector }) => {
    const chainId = web3.hook.useSelectedChainId(connector);
    const provider = web3.hook.useSelectedProvider(connector);

    const ens = web3.hook.useSelectedENSName(connector, provider);
    const address = web3.hook.useSelectedAccount(connector);
    const isActive = web3.hook.useSelectedIsActive(connector);
    const isActivating = web3.hook.useSelectedIsActivating(connector);

    const priority_connector = web3.hook.usePriorityConnector();

    return isActive ? (
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
            <NLStaticImage
                //@ts-ignore
                image={`${connector.info.label}_icon`}
            />

            <InteractiveText action={() => web3.config.gotoEtherscan(chainId, 'address', address)}>
                {ens}
            </InteractiveText>
            {priority_connector.info.label !== connector.info.label && (
                <Button
                    label="Switch To"
                    onClick={() =>
                        client.actions.updateProtocol({ manualPriority: connector.info.label })
                    }
                />
            )}
            <Button
                label="Disconnect"
                onClick={() => {
                    connector.deactivate();
                    state.app.dispatch.toggleWalletManager();
                }}
            />
        </div>
    ) : null;
};

export default Connection;
