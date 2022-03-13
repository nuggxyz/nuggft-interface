import React, { CSSProperties } from 'react';

import web3 from '@src/web3';
import InteractiveText from '@src/components/general/Texts/InteractiveText/InteractiveText';
import { SimpleSizes } from '@src/lib/layout';

type Props = {
    address: string;
    route: 'tx' | 'address';
    param: string;
    textStyle: CSSProperties;
    size: SimpleSizes;
};

const AddressViewer = ({ address, route, param, textStyle, size }: Props) => {
    const chainId = web3.hook.usePriorityChainId();

    const provider = web3.hook.usePriorityProvider();

    const ens = web3.hook.usePriorityAnyENSName(provider, address);

    return chainId && ens && provider ? (
        <InteractiveText
            type="text"
            size={size}
            textStyle={{ ...textStyle }}
            action={() => {
                web3.config.gotoEtherscan(chainId, route, param);
            }}
        >
            {ens}
        </InteractiveText>
    ) : null;
};

export default AddressViewer;
