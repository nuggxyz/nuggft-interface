import React, { FunctionComponent } from 'react';

import Wallet from '../../components/nugg/Wallet/Wallet';

type Props = {};

const WalletView: FunctionComponent<Props> = () => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                padding: '0rem 1rem',
            }}>
            <Wallet />
        </div>
    );
};

export default WalletView;
