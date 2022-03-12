import React, { CSSProperties, FunctionComponent, useMemo } from 'react';

import lib, { parseTokenIdSmart } from '@src/lib';
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

    const lastSwap__tokenId = client.live.lastSwap.tokenId();
    const { token, epoch, lifecycle } = client.hook.useLiveToken(lastSwap__tokenId);

    // console.log({ token, lifecycle });

    const blockDuration = useMemo(() => {
        let remaining = 0;
        if (token?.activeSwap?.epoch) {
            remaining = +token.activeSwap.epoch.endblock - +token.activeSwap.epoch.startblock;
        }
        if (remaining <= 0) {
            remaining = 0;
        }
        return remaining;
    }, [token?.activeSwap?.epoch]);

    const blocksRemaining = useMemo(() => {
        let remaining = 0;

        if (token?.activeSwap?.epoch && blocknum) {
            remaining = +token.activeSwap.epoch.endblock - +blocknum;
        }

        return remaining;
    }, [blocknum, token?.activeSwap?.epoch]);

    return (
        <div style={{ width: '100%', height: '100%', ...containerStyle }}>
            <CircleTimer
                duration={blockDuration}
                remaining={blocksRemaining}
                blocktime={constants.BLOCKTIME}
                width={circleWidth}
                staticColor={
                    lifecycle === 'stands'
                        ? lib.colors.darkerGray
                        : lifecycle === 'bench'
                        ? lib.colors.nuggGold
                        : lifecycle === 'deck'
                        ? lib.colors.green
                        : lifecycle === 'bat'
                        ? ''
                        : 'purple'
                }
                style={{
                    ...styles.circle,
                    ...circleStyle,
                    flexDirection: 'column',
                }}
            >
                {lastSwap__tokenId && (
                    <>
                        <AnimatedCard>
                            <TokenViewer tokenId={lastSwap__tokenId} style={tokenStyle} showcase />
                        </AnimatedCard>
                        {screenType !== 'phone' ? (
                            <Text>{parseTokenIdSmart(lastSwap__tokenId)}</Text>
                        ) : (
                            <></>
                        )}
                    </>
                )}
            </CircleTimer>
        </div>
    );
};

export default React.memo(TheRing);
