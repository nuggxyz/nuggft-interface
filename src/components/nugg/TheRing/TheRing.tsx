/* eslint-disable no-nested-ternary */
import React, { CSSProperties, FunctionComponent, useMemo } from 'react';
import { plural, t } from '@lingui/macro';
import { add, formatDistanceToNowStrict } from 'date-fns';

import lib from '@src/lib';
import constants from '@src/lib/constants';
import AppState from '@src/state/app';
import CircleTimer from '@src/components/general/AnimatedTimers/CircleTimer/CircleTimer';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import TokenViewer from '@src/components/nugg/TokenViewer';
import client from '@src/client';
import Label from '@src/components/general/Label/Label';
import { Lifecycle } from '@src/client/interfaces';
import web3 from '@src/web3';
import { useDarkMode } from '@src/client/hooks/useDarkMode';

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
    const chainId = web3.hook.usePriorityChainId();

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

    const darkmode = useDarkMode();

    const time = useMemo(() => {
        return Number(
            `${
                formatDistanceToNowStrict(
                    add(new Date(), {
                        seconds: blocksRemaining * 12,
                    }),
                    {
                        // addSuffix: true,
                        unit: 'minute',
                        // addSuffix: false,
                        roundingMethod: 'floor',
                        // roundingMethod: 'floor',
                        // locale: dates[locale],
                        // includeSeconds: true
                    },
                ).split(' ')[0]
            }`,
        );
    }, [blocksRemaining]);

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
                        : 'white'
                }
                style={{
                    ...styles.circle,
                    ...circleStyle,
                    flexDirection: 'column',
                }}
            >
                {tokenId && (
                    <>
                        {chainId && token && token.lifecycle === Lifecycle.Deck && (
                            <Label
                                text={t`countdown begins in ${
                                    blocksRemaining % web3.config.CONTRACTS[chainId].Interval
                                } blocks`}
                            />
                        )}
                        <AnimatedCard>
                            <TokenViewer tokenId={tokenId} style={tokenStyle} showcase />
                        </AnimatedCard>

                        {/* {screenType !== 'phone' && (
                            <Label
                                text={parseTokenIdSmart(tokenId)}
                                containerStyles={
                                    darkmode
                                        ? {
                                              background: lib.colors.nuggBlueTransparent,
                                              color: lib.colors.nuggBlueText,
                                          }
                                        : {}
                                }
                            />
                        )} */}

                        {screenType !== 'phone' && (
                            <Label
                                text={`ending in about ${time} ${plural(time, {
                                    1: 'minute',
                                    other: 'minutes',
                                })}`}
                                // eslint-disable-next-line no-constant-condition
                                size={time < 5 ? 'large' : 'medium'}
                                textStyle={{ fontSize: '10px' }}
                                containerStyles={{
                                    ...(darkmode
                                        ? {
                                              background: lib.colors.nuggBlueTransparent,
                                              color: lib.colors.nuggBlueText,
                                          }
                                        : {}),
                                    marginTop: '5px',
                                }}
                            />
                        )}
                    </>
                )}
            </CircleTimer>
        </div>
    );
};

export default React.memo(TheRing);
