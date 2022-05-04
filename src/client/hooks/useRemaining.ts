import React, { useMemo } from 'react';

import { EpochData } from '@src/client/interfaces';
import client from '@src/client';
import web3 from '@src/web3';
import useInterval from '@src/hooks/useInterval';

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

    return {
        blockDuration,
        blocksRemaining,
        ...time,
    };
};

export const useRemainingTrueSeconds = (seconds: number) => {
    const [trueSeconds, setTrueSeconds] = React.useState(seconds);

    const activate = React.useMemo(() => {
        return seconds && seconds > 0 && seconds < 100;
    }, [seconds]);

    useInterval(
        React.useCallback(() => {
            setTrueSeconds(trueSeconds - 1);
        }, [trueSeconds, setTrueSeconds]),
        activate ? 1000 : null,
    );

    React.useEffect(() => {
        setTrueSeconds(seconds);
    }, [seconds, setTrueSeconds]);

    return trueSeconds;
};
