import React, { CSSProperties, FunctionComponent, useMemo } from 'react';

import {
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrObjectEmpty,
} from '../../../lib';
import Colors from '../../../lib/colors';
import constants from '../../../lib/constants';
import AppState from '../../../state/app';
import ProtocolState from '../../../state/protocol';
import SwapState from '../../../state/swap';
import CircleTimer from '../../general/AnimatedTimers/CircleTimer/CircleTimer';
import AnimatedCard from '../../general/Cards/AnimatedCard/AnimatedCard';
import TokenViewer from '../TokenViewer';

import styles from './TheRing.styles';

type Props = {
    containerStyle?: CSSProperties;
    circleStyle?: CSSProperties;
    circleWidth?: number;
    tokenStyle?: CSSProperties;
};

const TheRing: FunctionComponent<Props> = ({
    containerStyle,
    circleStyle,
    circleWidth = 1600,
    tokenStyle,
}) => {
    const screenType = AppState.select.screenType();
    const lastBlock = ProtocolState.select.currentBlock();
    const epoch = ProtocolState.select.epoch();
    const endingSwapEpoch = SwapState.select.epoch();
    const startingSwapEpoch = SwapState.select.startingEpoch();
    const nugg = SwapState.select.nugg();
    const status = SwapState.select.status();

    const blockDuration = useMemo(() => {
        let remaining = 0;
        if (
            !isUndefinedOrNullOrObjectEmpty(endingSwapEpoch) &&
            !isUndefinedOrNullOrObjectEmpty(startingSwapEpoch)
        ) {
            remaining =
                +endingSwapEpoch.endblock - +startingSwapEpoch.startblock;
        }
        if (remaining <= 0) {
            remaining = 0;
        }
        return remaining;
    }, [endingSwapEpoch, startingSwapEpoch]);

    const blocksRemaining = useMemo(() => {
        let remaining = 0;

        if (
            !isUndefinedOrNullOrObjectEmpty(endingSwapEpoch) &&
            !isUndefinedOrNullOrNumberZero(lastBlock)
        ) {
            remaining = +endingSwapEpoch.endblock - +lastBlock;
        }
        if (remaining <= 0) {
            remaining = 0;
        }

        return remaining;
    }, [lastBlock, endingSwapEpoch]);

    return (
        <div style={{ width: '100%', height: '100%', ...containerStyle }}>
            <CircleTimer
                duration={blockDuration}
                remaining={blocksRemaining}
                blocktime={constants.BLOCKTIME}
                width={circleWidth}
                staticColor={
                    status === 'over'
                        ? Colors.purple
                        : status === 'waiting'
                        ? Colors.green
                        : ''
                }
                style={{ ...styles.circle, ...circleStyle }}>
                <AnimatedCard>
                    <TokenViewer
                        tokenId={(nugg && nugg.id) || ''}
                        showLabel={screenType !== 'phone'}
                        style={tokenStyle}
                    />
                </AnimatedCard>
            </CircleTimer>
        </div>
    );
};

export default React.memo(TheRing);
