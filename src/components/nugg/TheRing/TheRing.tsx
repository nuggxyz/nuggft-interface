import React, { CSSProperties, FunctionComponent, useMemo } from 'react';

import { isUndefinedOrNullOrObjectEmpty } from '../../../lib';
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
    const end = SwapState.select.epoch();
    const nugg = SwapState.select.nugg();
    const status = SwapState.select.status();

    const blockDuration = useMemo(() => {
        let remaining = 0;
        if (
            !isUndefinedOrNullOrObjectEmpty(epoch) &&
            !isUndefinedOrNullOrObjectEmpty(end)
        ) {
            remaining = +end.endblock - +epoch.startblock;
        }
        if (remaining <= 0) {
            remaining = 0;
        }
        return remaining;
    }, [epoch, end]);

    const blocksRemaining = useMemo(() => {
        let remaining = 0;

        if (
            !isUndefinedOrNullOrObjectEmpty(epoch) &&
            !isUndefinedOrNullOrObjectEmpty(end)
        ) {
            remaining = end.endblock - lastBlock;
        }
        if (remaining <= 0) {
            remaining = 0;
        }

        return remaining;
    }, [lastBlock, epoch, end]);

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
