import React, { FunctionComponent } from 'react';

import Wallet from '../../components/nugg/Wallet/Wallet';

type Props = {};

const WalletView: FunctionComponent<Props> = () => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                width: '100%',
                height: '95%',
                padding: '0rem .5rem',
            }}>
            <Wallet />
        </div>
    );
};

export default WalletView;
