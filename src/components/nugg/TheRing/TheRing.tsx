/* eslint-disable no-nested-ternary */
import React, { CSSProperties, FunctionComponent } from 'react';
import { IoWarning } from 'react-icons/io5';

import lib from '@src/lib';
import constants from '@src/lib/constants';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import TokenViewer from '@src/components/nugg/TokenViewer';
import client from '@src/client';
import { Lifecycle } from '@src/client/interfaces';
import web3 from '@src/web3';
import Text from '@src/components/general/Texts/Text/Text';
import useLifecycle from '@src/client/hooks/useLifecycle';
import useDimensions from '@src/client/hooks/useDimensions';
import useDesktopSwappingNugg from '@src/client/hooks/useDesktopSwappingNugg';
import useTriggerPageLoad from '@src/client/hooks/useTriggerPageLoad';
import CircleTimer from '@src/components/general/AnimatedTimers/CircleTimer/CircleTimer';
import CircleTimerMobileCSS from '@src/components/general/AnimatedTimers/CircleTimer/CircleTimerMobileCSS';

import styles from './TheRing.styles';

type Props = {
    containerStyle?: CSSProperties;
    circleStyle?: CSSProperties;
    circleWidth?: number;
    tokenStyle?: CSSProperties;
    manualTokenId?: TokenId;
    disableHover?: boolean;
    circleChildrenContainerStyle?: CSSProperties;
    disableClick?: boolean;
    strokeWidth?: number;
    defaultColor?: string;
};

const TheRing: FunctionComponent<Props> = ({
    containerStyle,
    circleStyle,
    circleChildrenContainerStyle,
    circleWidth = 1600,
    tokenStyle,
    manualTokenId,
    disableHover = false,
    disableClick = false,
    strokeWidth,
    defaultColor = lib.colors.nuggBlue,
}) => {
    const { screen: screenType, isPhone } = useDimensions();

    const tokenId = useDesktopSwappingNugg(manualTokenId);

    const swap = client.swaps.useSwap(tokenId);
    const lifecycle = useLifecycle(swap);
    const blocknum = client.block.useBlock();

    const startblock = client.epoch.active.useStartBlock();

    useTriggerPageLoad(!isPhone && swap, 5000);

    const showWarning = React.useMemo(() => {
        if (
            lifecycle === Lifecycle.Bunt &&
            swap &&
            blocknum &&
            startblock &&
            +startblock + 255 - blocknum < 75
        )
            return +startblock + 255 - blocknum - 17;

        return 0;
    }, [startblock, blocknum, lifecycle, swap]);

    const { blocksRemaining } = client.epoch.useEpoch(swap?.epoch?.id, blocknum);

    const CircleTimerWrap = React.useMemo(() => {
        return isPhone ? CircleTimerMobileCSS : CircleTimer;
    }, [isPhone]);
    return (
        <div style={{ width: '100%', height: '100%', ...containerStyle }}>
            <CircleTimerWrap
                duration={web3.config.DEFAULT_CONTRACTS.Interval}
                remaining={blocksRemaining ?? 0}
                tokenId={tokenId}
                blocktime={constants.BLOCKTIME}
                width={circleWidth}
                childrenContainerStyle={circleChildrenContainerStyle}
                defaultColor={defaultColor}
                staticColor={
                    swap && lifecycle
                        ? lifecycle === Lifecycle.Stands
                            ? lib.colors.darkerGray
                            : lifecycle === Lifecycle.Bench
                            ? lib.colors.nuggGold
                            : lifecycle === Lifecycle.Deck
                            ? lib.colors.green
                            : lifecycle === Lifecycle.Bat || lifecycle === Lifecycle.Bunt
                            ? ''
                            : lifecycle === Lifecycle.Cut
                            ? lib.colors.red
                            : lifecycle === Lifecycle.Minors
                            ? lib.colors.nuggGold
                            : isPhone
                            ? 'white'
                            : 'purple'
                        : 'white'
                }
                style={{
                    ...styles.circle,
                    ...circleStyle,
                    flexDirection: 'column',
                }}
                strokeWidth={
                    strokeWidth || (screenType === 'phone' ? 10 : screenType === 'tablet' ? 13 : 20)
                }
            >
                {isPhone ? (
                    <TokenViewer
                        tokenId={tokenId}
                        style={{ ...tokenStyle, zIndex: 101 }}
                        showcase
                        disableOnClick={disableClick}
                    />
                ) : (
                    <>
                        {/* {chainId && swap && lifecycle === Lifecycle.Deck && (
                            <Label
                                text={t`countdown begins in ${countdownMinutes} minutes`}
                                containerStyles={{
                                    ...(screenType === 'phone'
                                        ? { position: 'absolute', top: 50, zIndex: 950 }
                                        : {}),
                                }}
                            />
                        )} */}
                        <AnimatedCard disable={disableHover}>
                            <TokenViewer
                                tokenId={tokenId}
                                style={tokenStyle}
                                showcase
                                disableOnClick={disableClick}
                            />
                        </AnimatedCard>

                        {showWarning !== 0 && (
                            <div
                                style={{
                                    display: 'flex',
                                    padding: '10px',
                                    justifyContent: 'center',
                                    background: 'white',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    borderRadius: lib.layout.borderRadius.medium,
                                    zIndex: 1000,
                                    border: '5px solid red',
                                    position: 'absolute',
                                    top: 300,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',

                                        alignItems: 'center',
                                    }}
                                >
                                    <IoWarning size="25px" color="red" />
                                    <Text size="larger" textStyle={{ color: 'red' }}>
                                        Warning
                                    </Text>
                                </div>
                                <Text
                                    textStyle={{ padding: '5px', textAlign: 'center' }}
                                >{`If Nugg ${tokenId} is not bid on in ${showWarning} blocks, it will DIE`}</Text>
                            </div>
                        )}
                    </>
                )}
            </CircleTimerWrap>
        </div>
    );
};

export default React.memo(
    TheRing,
    (a, b) => a.manualTokenId === b.manualTokenId && a.defaultColor === b.defaultColor,
);
