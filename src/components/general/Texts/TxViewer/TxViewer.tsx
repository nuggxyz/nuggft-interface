import React, { CSSProperties } from 'react';

import web3 from '@src/web3';
import InteractiveText from '@src/components/general/Texts/InteractiveText/InteractiveText';
import { SimpleSizes } from '@src/lib/layout';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import { EthInt } from '@src/classes/Fraction';

type Props = {
	address: AddressString;
	hash: Hash;
	textStyle: CSSProperties;
	size: SimpleSizes;
	isNugg: boolean;
};

const TxViewer = ({ address, hash, textStyle, size, isNugg }: Props) => {
	const chainId = web3.hook.usePriorityChainId();

	const provider = web3.hook.usePriorityProvider();

	const tx = web3.hook.usePriorityTx(hash);

	const ens = web3.hook.usePriorityAnyENSName(isNugg ? 'nugg' : provider, address);

	return chainId && ens ? (
		<div
			style={{
				width: '100%',
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
			}}
		>
			<InteractiveText
				type="text"
				size={size}
				textStyle={{ ...textStyle, marginTop: '5px' }}
				action={() => {
					web3.config.gotoEtherscan(chainId, 'tx', hash);
				}}
			>
				{ens}
			</InteractiveText>
			{tx && (
				<>
					⛽️
					<CurrencyText
						decimals={0}
						size="smaller"
						forceGwei
						value={EthInt.fromGwei(tx.gasUsed).decimal.toNumber()}
					/>
				</>
			)}
		</div>
	) : null;
};

export default TxViewer;
