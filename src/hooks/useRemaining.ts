import { useMemo } from 'react';

import { EpochData } from '@src/client/interfaces';
import client from '@src/client';

export default (epoch: EpochData | undefined | null) => {
    const blocknum = client.live.blocknum();

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
        return {
            seconds,
            minutes,
        };
        // return Number(
        //     `${
        //         formatDistanceToNowStrict(
        //             add(new Date(), {
        //                 seconds: blocksRemaining * 12,
        //             }),
        //             {
        //                 // addSuffix: true,
        //                 unit: 'minute',
        //                 // addSuffix: false,
        //                 roundingMethod: 'floor',
        //                 // roundingMethod: 'floor',
        //                 // locale: dates[locale],
        //                 // includeSeconds: true
        //             },
        //         ).split(' ')[0]
        // }`,
        // );
    }, [blocksRemaining]);

    return {
        blockDuration,
        blocksRemaining,
        ...time,
    };
};
