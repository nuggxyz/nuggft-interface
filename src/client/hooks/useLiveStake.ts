import React, { useCallback } from 'react';
import { gql } from '@apollo/client';
import { BigNumber } from 'ethers';

import { useStake } from '@src/state/socket/hooks';
import client from '@src/client';
import { EthInt, Fraction } from '@src/classes/Fraction';

const query = gql`
    subscription useLiveStake {
        protocol {
            nuggftStakedEth
            nuggftStakedShares
        }
    }
`;

type Stake = {
    staked: BigNumber;
    shares: BigNumber;
    eps: EthInt;
};

export const useLiveStake = () => {
    const apollo = client.live.apollo();

    const [offers, setStake] = React.useState<Stake>(undefined);

    React.useEffect(() => {
        if (apollo) {
            const instance = apollo
                .subscribe<{
                    protocol: {
                        nuggftStakedEth: string;
                        nuggftStakedShares: string;
                    };
                }>({ query: query, variables: {} })
                .subscribe((x) => {
                    const shares = BigNumber.from(x.data.protocol.nuggftStakedShares);

                    const staked = BigNumber.from(x.data.protocol.nuggftStakedEth);

                    setStake({
                        staked,
                        shares,
                        eps: EthInt.fromFraction(new Fraction(staked, shares)),
                    });
                });
            return () => {
                instance.unsubscribe();
            };
        }
    }, [apollo]);

    return offers;
};

export const useSafeLiveStake = () => {
    const apolloStake = useLiveStake();

    const [stake, setStake] = React.useState<Stake>();

    // LOOK #41 @danny7even comment this out if you want to see the effect of the graph subscription
    ////////////////////////////////
    useStake((x) => {
        const shares = BigNumber.from(x.shares);

        const staked = BigNumber.from(x.staked);

        const input = {
            staked,
            shares,
            eps: EthInt.fromFraction(new Fraction(staked, shares)),
        };

        merge(input);
    });
    ////////////////////////////////

    const merge = useCallback(
        (input: Stake) => {
            if (!stake || input.eps.gt(stake.eps)) setStake(input);
        },
        [stake],
    );

    React.useEffect(() => {
        if (apolloStake && (!stake || apolloStake.eps.gt(stake.eps))) {
            setStake(apolloStake);
        }
    }, [apolloStake, stake]);

    return { stake };
};
