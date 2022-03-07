import React, { CSSProperties, FunctionComponent, useMemo } from 'react';

import useSetState from '@src/hooks/useSetState';
import {
    isUndefinedOrNull,
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrObjectEmpty,
    parseTokenIdSmart,
} from '@src/lib';
import Colors from '@src/lib/colors';
import constants from '@src/lib/constants';
import AppState from '@src/state/app';
import CircleTimer from '@src/components/general/AnimatedTimers/CircleTimer/CircleTimer';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import client from '@src/client';

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
    const blocknum = client.live.blocknum();
    const epoch = client.live.epoch();

    const lastSwap__tokenId = client.live.lastSwap__tokenId();

    const token = client.hook.useLiveToken(lastSwap__tokenId);

    const status = useSetState(() => {
        console.log({ token });
        return isUndefinedOrNull(token?.activeSwap?.epoch)
            ? 'waiting'
            : epoch &&
              +token.activeSwap.epoch.endblock >= +epoch.endblock &&
              blocknum !== +token.activeSwap.epoch.endblock
            ? 'ongoing'
            : 'over';
    }, [epoch, token?.activeSwap?.epoch, blocknum]);

    const blockDuration = useMemo(() => {
        let remaining = 0;
        if (!isUndefinedOrNullOrObjectEmpty(token?.activeSwap?.epoch)) {
            remaining = +token.activeSwap.epoch.endblock - +token.activeSwap.epoch.startblock;
        }
        if (remaining <= 0) {
            remaining = 0;
        }
        return remaining;
    }, [token?.activeSwap?.epoch]);

    const blocksRemaining = useMemo(() => {
        let remaining = 0;

        if (
            !isUndefinedOrNullOrObjectEmpty(token?.activeSwap?.epoch) &&
            !isUndefinedOrNullOrNumberZero(blocknum)
        ) {
            remaining = +token.activeSwap.epoch.endblock - +blocknum;
        }

        return remaining;
    }, [blocknum, token?.activeSwap?.epoch, status]);

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
                    <TokenViewer tokenId={lastSwap__tokenId} style={tokenStyle} showcase />
                </AnimatedCard>
                {screenType !== 'phone' && <Text>{parseTokenIdSmart(lastSwap__tokenId)}</Text>}
            </CircleTimer>
        </div>
    );
};

export default React.memo(TheRing);
