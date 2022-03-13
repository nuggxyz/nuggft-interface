import React, { FunctionComponent } from 'react';
import { HiOutlineRefresh } from 'react-icons/hi';
import { animated, config, useSpring } from '@react-spring/web';
import { ChevronUp } from 'react-feather';

import client from '@src/client';
import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import { SwapData } from '@src/client/core';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import FontSize from '@src/lib/fontSize';
import styles2 from '@src/components/nugg/RingAbout/RingAbout.styles';
import AppState from '@src/state/app';
import Flyout from '@src/components/general/Flyout/Flyout';

type Props = Record<string, never>;

const NextSwap: FunctionComponent<Props> = () => {
    const activeswaps = client.live.activeSwaps();
    const screenType = AppState.select.screenType();

    const epoch__id = client.live.epoch.id();

    const [prevEpochId, setPrevEpochId] = React.useState<number>(0);

    const lastSwap__tokenId = client.live.lastSwap.tokenId();
    const [on] = React.useState(true);
    const [open] = React.useState(true);
    const [waiting, setWaiting] = React.useState(false);
    const [queue, setQueue] = React.useState<SwapData>();
    const [auto, setAuto] = React.useState<boolean>(true);

    const abc = React.useCallback(
        (tokenId: string) => {
            setWaiting(true);
            setTimeout(() => {
                client.actions.routeTo(tokenId, false);
                setWaiting(false);
                setQueue(undefined);

                if (auto) {
                    // setQueue()
                }
            }, 5000);
        },
        [on],
    );

    React.useEffect(() => {
        if (epoch__id) {
            if (prevEpochId !== 0 && epoch__id) {
                abc(epoch__id.toString());
            }
            setPrevEpochId(epoch__id);
        }
    }, [epoch__id, abc, prevEpochId]);

    const springStyle = useSpring({
        background: lib.colors.transparentGrey,
        width: '100%',
        borderRadius: lib.layout.borderRadius.mediumish,
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
                        borderRadius: lib.layout.borderRadius.large,
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
                            borderRadius: lib.layout.borderRadius.large,
                            ...styles,
                        }}
                    >
                        <HiOutlineRefresh
                            color={waiting ? lib.colors.red : lib.colors.nuggBlueText}
                        />
                    </animated.div>
                </div>
            }
        >
            <animated.div
                style={{
                    background: springStyle.opacity.to(
                        [0, 1],
                        ['#FFFFFF00', lib.colors.transparentWhite],
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
                                    borderRadius: lib.layout.borderRadius.large,
                                    ...styles,
                                }}
                            >
                                <HiOutlineRefresh
                                    color={
                                        waiting ? lib.colors.red : lib.colors.nuggBlueText
                                    }
                                />
                            </animated.div>
                        )}
                        {activeswaps.length > 1 && (
                            <Button
                                rightIcon={
                                    open ? (
                                        <ChevronUp color={lib.colors.nuggBlueText} size={14} />
                                    ) : (
                                        <ChevronDown
                                            color={lib.colors.nuggBlueText}
                                            size={14}
                                        />
                                    )
                                }
                                onClick={() => setOpen(!open)}
                                buttonStyle={{
                                    borderRadius: lib.layout.borderRadius.large,
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
                                borderRadius: lib.layout.borderRadius.large,
                                margin: '0rem',
                                padding: '.2rem .6rem',
                                height: '30px',
                            }}
                            textStyle={{
                                color: lib.colors.nuggRedText,
                                fontSize: FontSize.h6,
                                fontFamily: lib.layout.font.sf.regular,
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
                                    // eslint-disable-next-line @typescript-eslint/no-use-before-define
                                    <SwapRenderItem
                                        swap={swap}
                                        index={index}
                                        setQueue={setQueue}
                                        key={index}
                                    />
                                ),
                        )}
                </animated.div>
            </animated.div>
        </Flyout>
    );
};

export default NextSwap;

const SwapRenderItem = ({
    swap,
    setQueue,
}: {
    swap: SwapData;
    index: number;
    setQueue: React.Dispatch<React.SetStateAction<SwapData | undefined>>;
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
                <ChevronUp color={lib.colors.nuggBlueText} size={14} />
            )}
            <Text type="text" size="smaller">
                {swap.tokenId}
            </Text>
            <Button
                buttonStyle={{
                    background: 'white',
                    borderRadius: lib.layout.borderRadius.large,
                    margin: '0rem',
                    padding: '.2rem .6rem',
                }}
                textStyle={{
                    color: lib.colors.nuggRedText,
                    fontSize: FontSize.h6,
                    fontFamily: lib.layout.font.sf.regular,
                }}
                label="queue"
                onClick={() => setQueue(swap)}
                // onClick={() => WalletState.dispatch.mintNugg({ chainId, provider, address })}
            />
            <CurrencyText value={swap.eth.decimal.toNumber()} />
        </div>
    );
};
