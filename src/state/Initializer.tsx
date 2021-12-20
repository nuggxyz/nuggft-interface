import React, { FunctionComponent, ReactChild } from 'react';

import Web3Updater from './web3/updater';
import App from './app/updater';
import NuggDex from './nuggdex/updater';
import Protocol from './protocol/updater';
import Swap from './swap/updater';
import Token from './token/updater';
import Transaction from './transaction/updater';
import WalletUpdater from './wallet/updater';

type Props = {
    children: ReactChild | ReactChild[];
};

const Initializer: FunctionComponent<Props> = ({ children }) => (
    <>
        <App />
        <NuggDex />
        <Protocol />
        <Swap />
        <Token />
        <Transaction />
        <WalletUpdater />
        <Web3Updater />
        {children}
    </>
);

export default Initializer;
