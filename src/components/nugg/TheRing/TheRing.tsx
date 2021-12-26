import React, { CSSProperties, FunctionComponent, useMemo } from 'react';

import {
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrObjectEmpty,
} from '../../../lib';
import Colors from '../../../lib/colors';
import constants from '../../../lib/constants';
import ProtocolState from '../../../state/protocol';
import SwapState from '../../../state/swap';
import CircleTimer from '../../general/AnimatedTimers/CircleTimer/CircleTimer';
import AnimatedCard from '../../general/Cards/AnimatedCard/AnimatedCard';
import TokenViewer from '../TokenViewer';

import styles from './TheRing.styles';

type Props = {
    containerStyle?: CSSProperties;
    circleWidth?: number;
    tokenStyle?: CSSProperties;
};

const TheRing: FunctionComponent<Props> = ({
    containerStyle,
    circleWidth = 1600,
    tokenStyle,
}) => {
    const lastBlock = ProtocolState.select.currentBlock();
    const epoch = ProtocolState.select.epoch();
    const currentSwap = SwapState.select.epoch();
    const nugg = SwapState.select.nugg();
    const status = SwapState.select.status();

    const blockDuration = useMemo(() => {
        let remaining = 0;
        if (!isUndefinedOrNullOrObjectEmpty(currentSwap)) {
            remaining = +currentSwap.endblock - +currentSwap.startblock;
        }
        if (remaining <= 0) {
            remaining = 0;
        }
        return remaining;
    }, [currentSwap]);

    const blocksRemaining = useMemo(() => {
        let remaining = 0;

        if (
            !isUndefinedOrNullOrObjectEmpty(currentSwap) &&
            !isUndefinedOrNullOrNumberZero(lastBlock)
        ) {
            remaining = +currentSwap.endblock - +lastBlock;
        }
        if (remaining <= 0) {
            remaining = 0;
        }

        return remaining;
    }, [lastBlock, currentSwap]);

    console.log({ blockDuration, blocksRemaining, lastBlock });

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
                style={styles.circle}>
                <AnimatedCard>
                    <TokenViewer
                        tokenId={(nugg && nugg.id) || ''}
                        showLabel
                        style={tokenStyle}
                    />
                </AnimatedCard>
            </CircleTimer>
        </div>
    );
};

export default React.memo(TheRing);
