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
import Label from '@src/components/general/Label/Label';
import { Lifecycle } from '@src/client/interfaces';

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
    const token = client.live.token(tokenId);
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

        /// //////////////////////////////
        // @danny7even is this okay to add?
        //     the ring was starting to overshoot at the end of an epoch after I updated the token
        if (remaining <= 0) {
            remaining = 0;
        }
        /// //////////////////////////////

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
                    token
                        ? token.lifecycle === Lifecycle.Stands
                            ? lib.colors.darkerGray
                            : token.lifecycle === Lifecycle.Bench
                            ? lib.colors.nuggGold
                            : token.lifecycle === Lifecycle.Deck
                            ? lib.colors.green
                            : token.lifecycle === Lifecycle.Bat
                            ? ''
                            : 'purple'
                        : 'purple'
                }
                style={{
                    ...styles.circle,
                    ...circleStyle,
                    flexDirection: 'column',
                }}
            >
                {token && tokenId && (
                    <>
                        {token.lifecycle === Lifecycle.Deck && (
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
