import React, { useMemo } from 'react';

import { EpochData } from '@src/client/interfaces';
import client from '@src/client';
import web3 from '@src/web3';
import useInterval from '@src/hooks/useInterval';
import useThrottle from '@src/hooks/useThrottle';
import usePrevious from '@src/hooks/usePrevious';

const interval = web3.config.DEFAULT_CONTRACTS.Interval;

export default (epoch: EpochData | undefined | null) => {
	const blocknum = client.block.useBlock();

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
		// console.log('AYO');
		const seconds = blocksRemaining * 12;
		const minutes = Math.floor(seconds / 60);

		let countdownSeconds;
		let countdownMinutes;

		if (blocksRemaining >= interval) {
			countdownSeconds = (blocksRemaining % interval) * 12;
			countdownMinutes = Math.floor(countdownSeconds / 60);
		}

		return {
			seconds,
			minutes,
			countdownMinutes,
			countdownSeconds,
		};
	}, [blocksRemaining]);

	return [blocksRemaining, time.minutes, time.seconds];
};

export const useRemainingTrueSeconds = (seconds: number | null, always?: boolean) => {
	const [trueSeconds, setTrueSeconds] = React.useState(seconds);

	const activate = React.useMemo(() => {
		return always || (seconds && seconds > 0 && seconds < 100);
	}, [seconds, always]);

	useInterval(
		React.useCallback(() => {
			if (trueSeconds) setTrueSeconds(trueSeconds - 1);
		}, [trueSeconds, setTrueSeconds]),
		activate ? 1000 : null,
	);

	React.useEffect(() => {
		setTrueSeconds(seconds);
	}, [seconds, setTrueSeconds]);

	return trueSeconds;
};

export const useDebouncedSeconds = (seconds: number | null, ref: unknown) => {
	const [trueSeconds, setTrueSeconds] = React.useState(seconds ?? 0);
	const [hold, setHold] = React.useState(false);
	const [multip, setMultip] = React.useState(1000);

	const caller = useThrottle(
		React.useCallback(
			(secs: number) => {
				if (hold || !trueSeconds) return;
				if (secs > trueSeconds) {
					setHold(true);

					setMultip(Math.floor(((secs - trueSeconds) * 1000) / 12) + 1000);
					setTimeout(() => {
						setHold(false);
						setMultip(1000);
					}, 12 * 1000);
				} else if (trueSeconds !== secs) {
					setTrueSeconds(secs);
				}
			},
			[trueSeconds, hold],
		),
		12000,
	);

	useInterval(
		React.useCallback(() => {
			if (trueSeconds) setTrueSeconds(trueSeconds - 1);
		}, [trueSeconds, setTrueSeconds]),
		multip,
	);

	React.useEffect(() => {
		if (seconds) caller(seconds);
	}, [seconds]);

	const prevRef = usePrevious(ref);

	React.useEffect(() => {
		if (seconds && ref !== prevRef) {
			setTrueSeconds(seconds);
		}
	}, [seconds, ref, prevRef]);

	return [trueSeconds, hold] as const;
};
