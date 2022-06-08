import React from 'react';

import client from '@src/client';
import { Lifecycle } from '@src/client/interfaces';
import { Address } from '@src/classes/Address';
import web3 from '@src/web3';

export default (tokenId?: TokenId): Lifecycle | undefined => {
    const epoch = client.epoch.active.useId();
    const warning = client.epoch.active.useWarning();

    const address = web3.hook.usePriorityAccount();

    const token = client.live.token(tokenId);

    const [lifecycle, setLifecycle] = React.useState<Lifecycle>();

    React.useEffect(() => {
        const find = () => {
            if (!token) return undefined;

            const isToken = 'swaps' in token;

            let abc = isToken ? token.activeSwap : token;

            if (
                isToken &&
                token.isItem() &&
                !abc &&
                'upcomingActiveSwap' in token &&
                token.upcomingActiveSwap
            ) {
                abc = token.upcomingActiveSwap;
                // delete token.upcomingActiveSwap;
            }

            if (isToken && !abc && token.isItem() && token.tryout.count > 0) {
                if (token.tryout.count === 1) return Lifecycle.Formality;
                return Lifecycle.Tryout;
            }

            if (abc && epoch !== null) {
                if (!abc.endingEpoch) {
                    if (address === abc.owner && address === abc.leader)
                        return Lifecycle.Concessions;
                    if (abc.owner === web3.constants.DEFAULT_CONTRACTS.NuggftV1)
                        return Lifecycle.Minors;
                    return Lifecycle.Bench;
                }

                if (+abc.endingEpoch === epoch + 1) {
                    if (abc.type === 'nugg' && abc.owner === Address.ZERO.hash) {
                        return Lifecycle.Egg;
                    }
                    return Lifecycle.Deck;
                }

                if (abc.leader === Address.ZERO.hash && abc.epoch && warning) {
                    return Lifecycle.Cut;
                }

                if (+abc.endingEpoch === epoch) {
                    if (abc.type === 'nugg' && abc.owner === Address.ZERO.hash) {
                        return Lifecycle.Bunt;
                    }
                    return Lifecycle.Bat;
                }

                return Lifecycle.Shower;
            }
            return Lifecycle.Stands;
        };

        const check = find();

        if (check !== lifecycle) setLifecycle(check);
    }, [epoch, token, warning, address, lifecycle]);

    return lifecycle;
};
