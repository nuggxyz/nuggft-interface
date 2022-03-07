import React, { FunctionComponent } from 'react';
import { HiOutlineRefresh } from 'react-icons/hi';
import { animated, config, useSpring } from '@react-spring/web';
import { ChevronUp } from 'react-feather';

import client from '@src/client';
import { colors, layout } from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import { SwapData } from '@src/client/core';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Colors from '@src/lib/colors';
import FontSize from '@src/lib/fontSize';
import styles2 from '@src/components/nugg/RingAbout/RingAbout.styles';
import AppState from '@src/state/app';
import Flyout from '@src/components/general/Flyout/Flyout';
type Props = {};

const NextSwap: FunctionComponent<Props> = () => {
    const activeswaps = client.live.activeSwaps();
    const screenType = AppState.select.screenType();

    const epoch__id = client.live.epoch__id();

    const lastSwap__tokenId = client.live.lastSwap__tokenId();
    const [on, setOn] = React.useState(true);
    const [open, setOpen] = React.useState(true);
    const [waiting, setWaiting] = React.useState(false);
    const [queue, setQueue] = React.useState<SwapData>();
    const [auto, setAuto] = React.useState<boolean>(true);

    const abc = React.useCallback(
        (tokenId: string) => {
            if (on) {
                setWaiting(true);
                setTimeout(() => {
                    client.actions.routeTo(tokenId, false);
                    setWaiting(false);
                    setQueue(undefined);
                    if (auto) {
                        // setQueue()
                    }
                }, 5000);
            }
        },
        [on],
    );

    React.useEffect(() => {
        abc(epoch__id.toString());
    }, [epoch__id]);

    const springStyle = useSpring({
        background: colors.default.transparentGrey,
        width: '100%',
        borderRadius: layout.default.borderRadius.mediumish,
        height: open ? '150px' : '0px',
        opacity: open ? 1 : 0,
        padding: open ? '0.75rem' : '0rem',
        overflow: 'scroll',
    });

    const styles = useSpring({
        loop: true,
        config: config.molasses,
        from: { rotateZ: 0 },
        to: { rotateZ: 180 },
    });
    return (
        <Flyout
            style={{ marginTop: '40px' }}
            button={
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        height: 30,
                        background: 'white',
                        borderRadius: layout.default.borderRadius.large,
                    }}
                >
                    {queue && <Text textStyle={{ marginLeft: '10px' }}> {queue.tokenId}</Text>}
                    <animated.div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: 30,
                            height: 30,
                            background: 'white',
                            borderRadius: layout.default.borderRadius.large,
                            ...styles,
                        }}
                    >
                        <HiOutlineRefresh
                            color={waiting ? colors.default.red : colors.default.nuggBlueText}
                        />
                    </animated.div>
                </div>
            }
            children={
                <animated.div
                    style={{
                        background: springStyle.opacity.to(
                            [0, 1],
                            ['#FFFFFF00', colors.default.transparentWhite],
                        ),
                        display: 'flex',
                        justifyContent: 'center',
                        paddingLeft: '5px',
                        paddingRight: '15px',

                        marginBottom: '10px',
                        flexDirection: 'column',
                    }}
                >
                    <div
                        style={{
                            ...styles2[
                                screenType !== 'desktop'
                                    ? 'leadingOfferContainerMobile'
                                    : 'leadingOfferContainer'
                            ],
                            width: '250px',
                        }}
                    >
                        {queue && (
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'flex-start',
                                    width: '100%',
                                    marginBottom: '1.5rem',
                                    zIndex: 1,
                                    paddingLeft: '.4rem',
                                }}
                            >
                                <TokenViewer
                                    tokenId={queue.tokenId}
                                    style={{ width: '40px', height: '40px' }}
                                />
                                <Text type="text" size="smaller">
                                    {queue.tokenId}
                                </Text>
                            </div>
                        )}

                        {/* {auto && (
                            <animated.div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    width: 30,
                                    height: 30,
                                    background: 'white',
                                    borderRadius: layout.default.borderRadius.large,
                                    ...styles,
                                }}
                            >
                                <HiOutlineRefresh
                                    color={
                                        waiting ? colors.default.red : colors.default.nuggBlueText
                                    }
                                />
                            </animated.div>
                        )}
                        {activeswaps.length > 1 && (
                            <Button
                                rightIcon={
                                    open ? (
                                        <ChevronUp color={colors.default.nuggBlueText} size={14} />
                                    ) : (
                                        <ChevronDown
                                            color={colors.default.nuggBlueText}
                                            size={14}
                                        />
                                    )
                                }
                                onClick={() => setOpen(!open)}
                                buttonStyle={{
                                    borderRadius: layout.default.borderRadius.large,
                                    background: 'white',
                                    padding: '.44rem .45rem',
                                    margin: '0rem .5rem',
                                    // height: '40px',
                                }}
                            />
                        )} */}
                    </div>

                    <animated.div style={springStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Text textStyle={{ marginBottom: '1rem' }}>Up Next</Text>
                            <Button
                                buttonStyle={{
                                    background: 'white',
                                    borderRadius: layout.default.borderRadius.large,
                                    margin: '0rem',
                                    padding: '.2rem .6rem',
                                    height: '30px',
                                }}
                                textStyle={{
                                    color: Colors.nuggRedText,
                                    fontSize: FontSize.h6,
                                    fontFamily: layout.default.font.sf.regular,
                                }}
                                label="auto"
                                onClick={() => setAuto(!auto)}
                            />
                        </div>

                        {activeswaps &&
                            activeswaps.map(
                                (swap, index) =>
                                    swap.started &&
                                    swap.tokenId !== lastSwap__tokenId && (
                                        <SwapRenderItem
                                            {...{ swap, index, setQueue }}
                                            key={index}
                                        />
                                    ),
                            )}
                    </animated.div>
                    {/* <animated.div style={springStyle}>
                <Text textStyle={{ marginBottom: '1rem' }}>Not Started</Text>
                {activeswaps &&
                    activeswaps.map((swap, index) => (
                        <SwapRenderItem {...{ swap, index }} key={index} />
                    ))}
            </animated.div> */}
                </animated.div>
            }
        />
    );
};

export default NextSwap;

const SwapRenderItem = ({
    swap,
    index,
    setQueue,
}: {
    swap: SwapData;
    index: number;
    setQueue: React.Dispatch<React.SetStateAction<SwapData>>;
}) => {
    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                width: '100%',
                marginBottom: '1.5rem',
                zIndex: 1,
                paddingLeft: '.4rem',
            }}
        >
            {swap.tokenId !== '' ? (
                <TokenViewer tokenId={swap.tokenId} style={{ width: '40px', height: '40px' }} />
            ) : (
                <ChevronUp color={colors.default.nuggBlueText} size={14} />
            )}
            <Text type="text" size="smaller">
                {swap.tokenId}
            </Text>
            <Button
                buttonStyle={{
                    background: 'white',
                    borderRadius: layout.default.borderRadius.large,
                    margin: '0rem',
                    padding: '.2rem .6rem',
                }}
                textStyle={{
                    color: Colors.nuggRedText,
                    fontSize: FontSize.h6,
                    fontFamily: layout.default.font.sf.regular,
                }}
                label="queue"
                onClick={() => setQueue(swap)}
                // onClick={() => WalletState.dispatch.mintNugg({ chainId, provider, address })}
            />
            <CurrencyText value={swap.eth.decimal.toNumber()} />
        </div>
    );
};
