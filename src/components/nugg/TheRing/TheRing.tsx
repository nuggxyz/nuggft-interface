/* eslint-disable no-nested-ternary */
import React, { CSSProperties, FunctionComponent, useMemo } from 'react';

import lib, { parseTokenIdSmart } from '@src/lib';
import constants from '@src/lib/constants';
import AppState from '@src/state/app';
import CircleTimer from '@src/components/general/AnimatedTimers/CircleTimer/CircleTimer';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import client from '@src/client';
import { Lifecycle } from '@src/client/hooks/useLiveToken';
import Label from '@src/components/general/Label/Label';

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

    const tokenId = client.live.lastSwap.tokenId();
    const { token, lifecycle } = client.hook.useLiveToken(tokenId);

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
                    lifecycle === Lifecycle.Stands
                        ? lib.colors.darkerGray
                        : lifecycle === Lifecycle.Bench
                        ? lib.colors.nuggGold
                        : lifecycle === Lifecycle.Deck
                        ? lib.colors.green
                        : lifecycle === Lifecycle.Bat
                        ? ''
                        : 'purple'
                }
                style={{
                    ...styles.circle,
                    ...circleStyle,
                    flexDirection: 'column',
                }}
            >
                {tokenId && (
                    <>
                        {lifecycle === Lifecycle.Deck && (
                            <Label text={`countdown begins in ${blocksRemaining % 32} blocks`} />
                        )}
                        <AnimatedCard>
                            <TokenViewer tokenId={tokenId} style={tokenStyle} showcase />
                        </AnimatedCard>

                        {screenType !== 'phone' && <Text>{parseTokenIdSmart(tokenId)}</Text>}
                    </>
                )}
            </CircleTimer>
        </div>
    );
};

export default React.memo(TheRing);
