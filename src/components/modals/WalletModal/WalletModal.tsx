import React, { FunctionComponent } from 'react';

import ConnectTab from '@src/components/nugg/Wallet/tabs/ConnectTab/ConnectTab';

type Props = Record<string, never>;

const WalletModal: FunctionComponent<Props> = () => {
    return <ConnectTab />;
};

export default WalletModal;
