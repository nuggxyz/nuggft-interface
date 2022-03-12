import React, { CSSProperties } from 'react';

import web3 from '@src/web3';
import InteractiveText from '@src/components/general/Texts/InteractiveText/InteractiveText';
import { SimpleSizes } from '@src/lib/layout';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import { EthInt } from '@src/classes/Fraction';

type Props = {
    address: string;
    hash: string;
    textStyle: CSSProperties;
    size: SimpleSizes;
};

export default ({ address, hash, textStyle, size }: Props) => {
    const chainId = web3.hook.usePriorityChainId();

    const provider = web3.hook.usePriorityProvider();

    const tx = web3.hook.usePriorityTx(hash);

    const ens = web3.hook.usePriorityAnyENSName(provider, address);

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
                action={function (): void {
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
                        forceGwei={true}
                        value={EthInt.fromGwei(tx.gasUsed).decimal.toNumber()}
                    ></CurrencyText>
                </>
            )}
        </div>
    ) : null;
};
