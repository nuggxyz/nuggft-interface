import React, { useMemo } from 'react';

import { EpochData } from '@src/client/interfaces';
import client from '@src/client';
import web3 from '@src/web3';
import useRecursiveTimeout from '@src/hooks/useRecursiveTimeout';

export default (epoch: EpochData | undefined | null) => {
    const blocknum = client.live.blocknum();

    const chainId = web3.hook.usePriorityChainId();

    const blockDuration = useMemo(() => {
        let remaining = 0;
        if (epoch) {
            remaining = +epoch.endblock - +epoch.startblock;
        }
        if (remaining <= 0) {
            remaining = 0;
        }
        return remaining;
    }, [epoch]);

    const blocksRemaining = useMemo(() => {
        let remaining = 0;

        if (epoch && blocknum) {
            remaining = +epoch.endblock - +blocknum;
        }

        /// //////////////////////////////
        // @danny7even is this okay to add?
        //     the ring was starting to overshoot at the end of an epoch after I updated the token
        if (remaining <= 0) {
            remaining = 0;
        }
        /// //////////////////////////////

        return remaining;
    }, [blocknum, epoch]);

    const time = useMemo(() => {
        const seconds = blocksRemaining * 12;
        const minutes = Math.floor(seconds / 60);

        let countdownSeconds;
        let countdownMinutes;

        if (chainId) {
            const interval = web3.config.CONTRACTS[chainId].Interval;
            if (blocksRemaining >= interval) {
                countdownSeconds = (blocksRemaining % interval) * 12;
                countdownMinutes = Math.floor(countdownSeconds / 60);
            }
        }

        return {
            seconds,
            minutes,
            countdownMinutes,
            countdownSeconds,
        };
    }, [blocksRemaining, chainId]);

    // const [trueSeconds, setTrueSeconds] = React.useState(time.seconds);

    // useRecursiveTimeout(
    //     React.useCallback(() => {
    //         setTrueSeconds(trueSeconds - 1);
    //     }, [trueSeconds, setTrueSeconds]),
    //     1000,
    // );

    // React.useEffect(() => {
    //     setTrueSeconds(time.seconds);
    // }, [time.seconds, setTrueSeconds]);

    return {
        blockDuration,
        blocksRemaining,
        ...time,
        // trueSeconds,
    };
};

export const useRemainingTrueSeconds = (seconds: number) => {
    const [trueSeconds, setTrueSeconds] = React.useState(seconds);

    useRecursiveTimeout(
        React.useCallback(() => {
            setTrueSeconds(trueSeconds - 1);
        }, [trueSeconds, setTrueSeconds]),
        1000,
    );

    React.useEffect(() => {
        setTrueSeconds(seconds);
    }, [seconds, setTrueSeconds]);

    return trueSeconds;
};
