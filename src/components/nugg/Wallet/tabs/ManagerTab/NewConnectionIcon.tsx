import React, { FunctionComponent } from 'react';

import NLStaticImage from '@src/components/general/NLStaticImage';
import web3 from '@src/web3';
import { Connector } from '@src/web3/core/types';
type Props = {
    connector: Connector;
};

const NewConnectionIcon: FunctionComponent<Props> = ({ connector }) => {
    const chainId = web3.hook.useSelectedChainId(connector);
    const provider = web3.hook.useSelectedProvider(connector);

    const ens = web3.hook.useSelectedENSName(connector, provider);
    const address = web3.hook.useSelectedAccount(connector);
    const isActive = web3.hook.useSelectedIsActive(connector);
    const isActivating = web3.hook.useSelectedIsActivating(connector);

    const priority_connector = web3.hook.usePriorityConnector();

    return !isActive ? (
        <div
            style={{
                padding: '.25rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                width: '100%',
            }}
            onClick={async () => {
                console.log('yep');
                if (isActivating) {
                    await connector.deactivate();
                }
                connector.activate();
            }}
        >
            <NLStaticImage
                //@ts-ignore
                image={`${connector.info.label}_icon`}
            />
        </div>
    ) : null;
};

export default NewConnectionIcon;
