import { useCallback, useEffect } from 'react';

// eslint-disable-next-line import/no-cycle
import web3 from '@src/web3';
import { useNuggftV1 } from '@src/contracts/useContract';
import { EthInt } from '@src/classes/Fraction';

// eslint-disable-next-line import/no-cycle
import client from '..';

export default () => {
    const provider = web3.hook.usePriorityProvider();
    const nuggft = useNuggftV1(provider);
    const blocknum = client.live.blocknum();
    const updateProtocolSimple = client.mutate.updateProtocolSimple();

    const callback = useCallback(async () => {
        if (nuggft) {
            updateProtocolSimple({
                stake: EthInt.fromNuggftV1Stake(await nuggft.stake()),
            });
        }
    }, [nuggft, updateProtocolSimple]);

    useEffect(() => {
        void callback();
    }, [blocknum]);

    return null;
};
