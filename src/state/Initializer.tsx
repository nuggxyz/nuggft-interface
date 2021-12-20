import React, { FunctionComponent, ReactChild } from 'react';

import Web3Updater from './web3/updater';
import App from './app/updater';
import NuggDex from './nuggdex/updater';
import ProtocolUpdater from './protocol/updater';
import SwapUpdater from './swap/updater';
import TokenUpdater from './token/updater';
import TransactionUpdater from './transaction/updater';
import WalletUpdater from './wallet/updater';

type Props = {
    children: ReactChild | ReactChild[];
};

const Initializer: FunctionComponent<Props> = ({ children }) => (
    <>
        <App />
        <NuggDex />
        <ProtocolUpdater />
        <SwapUpdater />
        <TokenUpdater />
        <TransactionUpdater />
        <WalletUpdater />
        <Web3Updater />
        {children}
    </>
);

export default Initializer;
