import React, { FunctionComponent, useEffect } from 'react';

import ConnectTab from '@src/components/nugg/Wallet/tabs/ConnectTab/ConnectTab';
import web3 from '@src/web3';
import client from '@src/client';

type Props = Record<string, never>;

const WalletModal: FunctionComponent<Props> = () => {
	const address = web3.hook.usePriorityAccount();
	const closeModal = client.modal.useCloseModal();
	useEffect(() => {
		if (address) {
			closeModal();
		}
	}, [address, closeModal]);
	return <ConnectTab />;
};

export default WalletModal;
