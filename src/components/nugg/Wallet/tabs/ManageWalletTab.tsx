import React, { FunctionComponent } from 'react';

import Colors from '@src/lib/colors';
import Layout from '@src/lib/layout';

import Connection from './ManagerTab/Connection';

type Props = Record<string, never>;

const ManageWalletTab: FunctionComponent<Props> = () => {
    return (
        <div
            style={{
                padding: '.25rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
            }}
        >
            <div
                style={{
                    background: Colors.transparentWhite,
                    borderRadius: Layout.borderRadius.medium,
                    // margin: '1.5rem',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                }}
            >
                <Connection />
                {/* {(Object.keys(web3.config.connectors) as SupportedConnectors[]).map(
                    (connector) =>
                        connector !== 'infura' && (
                            <Connection
                                key={connector + '-connected-connectors'}
                                connector={web3.config.connectors[connector].connector}
                            />
                        ),
                )} */}
                {/* <div style={{ display: 'flex' }}>
                    {(Object.keys(web3.config.connectors) as SupportedConnectors[]).map(
                        (connector) =>
                            connector !== 'infura' && (
                                <NewConnectionIcon
                                    key={connector + '-connector-icons'}
                                    connector={web3.config.connectors[connector].connector}
                                />
                            ),
                    )}
                </div> */}
            </div>
        </div>
    );
};

export default ManageWalletTab;
