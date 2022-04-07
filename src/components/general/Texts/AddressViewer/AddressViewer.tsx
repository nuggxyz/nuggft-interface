import React, { CSSProperties } from 'react';

import web3 from '@src/web3';
import InteractiveText from '@src/components/general/Texts/InteractiveText/InteractiveText';
import { SimpleSizes } from '@src/lib/layout';

export default ({
    address,
    route,
    param,
    textStyle,
    size,
    isNugg,
}: {
    address: string;
    route: 'tx' | 'address';
    param: string;
    textStyle: CSSProperties;
    size: SimpleSizes;
    isNugg: boolean;
}) => {
    const chainId = web3.hook.usePriorityChainId();

    const provider = web3.hook.usePriorityProvider();

    const ens = web3.hook.usePriorityAnyENSName(isNugg ? 'nugg' : provider, address);

    return chainId && ens && provider ? (
        <InteractiveText
            type="text"
            size={size}
            textStyle={{ ...textStyle }}
            hideBorder
            action={() => {
                web3.config.gotoEtherscan(chainId, route, param);
            }}
        >
            {ens}
        </InteractiveText>
    ) : null;
};
