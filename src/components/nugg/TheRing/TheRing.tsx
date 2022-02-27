import React, { CSSProperties, FunctionComponent, useMemo } from 'react';

import useSetState from '@src/hooks/useSetState';
import {
    isUndefinedOrNull,
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrObjectEmpty,
} from '@src/lib';
import Colors from '@src/lib/colors';
import constants from '@src/lib/constants';
import AppState from '@src/state/app';
import ProtocolState from '@src/state/protocol';
import SwapState from '@src/state/swap';
import CircleTimer from '@src/components/general/AnimatedTimers/CircleTimer/CircleTimer';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import state from '@src/state';

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
    const blockListener = state.socket.select.Block();
    const epoch = ProtocolState.select.epoch();
    const endingSwapEpoch = SwapState.select.epoch();
    const startingSwapEpoch = SwapState.select.startingEpoch();
    const tokenId = SwapState.select.tokenId();

    const status = useSetState(() => {
        return isUndefinedOrNull(endingSwapEpoch)
            ? 'waiting'
            : epoch &&
              +endingSwapEpoch.endblock >= +epoch.endblock &&
              blockListener.block !== +endingSwapEpoch.endblock
            ? 'ongoing'
            : 'over';
    }, [epoch, endingSwapEpoch, blockListener]);

    const blockDuration = useMemo(() => {
        let remaining = 0;
        if (
            !isUndefinedOrNullOrObjectEmpty(endingSwapEpoch) &&
            !isUndefinedOrNullOrObjectEmpty(startingSwapEpoch)
        ) {
            remaining = +endingSwapEpoch.endblock - +startingSwapEpoch.startblock;
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
            !isUndefinedOrNullOrNumberZero(blockListener.block)
        ) {
            remaining = +endingSwapEpoch.endblock - +blockListener.block;
        }
        if (remaining <= 0) {
            remaining = 0;
            if (+blockListener.block !== 0 && status === 'over') {
                ProtocolState.dispatch.setEpochIsOver(true);
            } else {
                ProtocolState.dispatch.setEpochIsOver(false);
            }
        }

        return remaining;
    }, [blockListener, endingSwapEpoch, status]);

    return (
        <div style={{ width: '100%', height: '100%', ...containerStyle }}>
            <CircleTimer
                duration={blockDuration}
                remaining={blocksRemaining}
                blocktime={constants.BLOCKTIME}
                width={circleWidth}
                staticColor={
                    status === 'over' ? Colors.purple : status === 'waiting' ? Colors.green : ''
                }
                style={{
                    ...styles.circle,
                    ...circleStyle,
                    flexDirection: 'column',
                }}
            >
                <AnimatedCard>
                    <TokenViewer
                        tokenId={(tokenId && tokenId) || ''}
                        // showLabel={screenType !== 'phone'}
                        style={tokenStyle}
                    />
                </AnimatedCard>
                {screenType !== 'phone' && <Text>Nugg #{tokenId && tokenId}</Text>}
            </CircleTimer>
        </div>
    );
};

export default React.memo(TheRing);
