/* eslint-disable no-nested-ternary */
import React, { CSSProperties, FunctionComponent } from 'react';
import { t } from '@lingui/macro';
import { IoWarning } from 'react-icons/io5';

import lib from '@src/lib';
import constants from '@src/lib/constants';
import CircleTimer from '@src/components/general/AnimatedTimers/CircleTimer/CircleTimer';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import TokenViewer from '@src/components/nugg/TokenViewer';
import client from '@src/client';
import Label from '@src/components/general/Label/Label';
import { Lifecycle } from '@src/client/interfaces';
import web3 from '@src/web3';
import useRemaining from '@src/client/hooks/useRemaining';
import Text from '@src/components/general/Texts/Text/Text';
import useLifecycle from '@src/client/hooks/useLifecycle';
import useDimentions from '@src/client/hooks/useDimentions';

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
}) => {
    const { screen: screenType, isPhone } = useDimentions();

    const chainId = web3.hook.usePriorityChainId();

    const tokenId = client.live.lastSwap.tokenIdWithOptionalOverride(manualTokenId);
    const token = client.live.token(tokenId);
    const lifecycle = useLifecycle(token);
    const blocknum = client.live.blocknum();

    const showWarning = React.useMemo(() => {
        if (
            lifecycle === Lifecycle.Bunt &&
            token &&
            blocknum &&
            token.activeSwap?.epoch &&
            +token.activeSwap.epoch.startblock + 255 - blocknum < 75
        )
            return +token.activeSwap.epoch.startblock + 255 - blocknum - 17;

        return 0;
    }, [token, blocknum, lifecycle]);

    const { blocksRemaining, blockDuration, countdownMinutes } = useRemaining(
        token?.activeSwap?.epoch,
    );

    return (
        <div style={{ width: '100%', height: '100%', ...containerStyle }}>
            <CircleTimer
                duration={blockDuration}
                remaining={blocksRemaining}
                blocktime={constants.BLOCKTIME}
                width={circleWidth}
                childrenContainerStyle={circleChildrenContainerStyle}
                staticColor={
                    token && lifecycle
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
                {tokenId && (
                    <>
                        {chainId && token && lifecycle === Lifecycle.Deck && (
                            <Label
                                text={t`countdown begins in ${countdownMinutes} minutes`}
                                containerStyles={{
                                    ...(screenType === 'phone'
                                        ? { position: 'absolute', top: 50, zIndex: 950 }
                                        : {}),
                                }}
                            />
                        )}
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
            </CircleTimer>
        </div>
    );
};

export default React.memo(TheRing);
