import React, { FunctionComponent } from 'react';

import Wallet from '@src/components/nugg/Wallet/Wallet';

type Props = Record<string, never>;

const WalletView: FunctionComponent<Props> = () => {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                padding: '0rem .5rem',
            }}
        >
            <Wallet />
        </div>
    );
};

export default WalletView;
