/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, PropsWithChildren } from 'react';
import { animated, config, useSpring } from '@react-spring/web';

import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import emitter from '@src/emitter/index';
import web3 from '@src/web3';
import Text from '@src/components/general/Texts/Text/Text';
import NLStaticImage from '@src/components/general/NLStaticImage';
import useOnClickOutside from '@src/hooks/useOnClickOutside';
import { gotoDeepLink } from '@src/web3/config';

const StupidMfingHack: FC<PropsWithChildren<{ onClose?: () => void }>> = () => {
    const peer = web3.hook.usePriorityPeer();
    const [, startTransiton] = React.useTransition();

    const [open, setOpen] = React.useState(false);

    const [trans] = useSpring(
        {
            opacity: open ? 1 : 0,
            pointerEvents: open ? 'auto' : 'none',
            delay: 1000,
            config: config.slow,
        },
        [open],
    );

    emitter.hook.useOn({
        type: emitter.events.TransactionSent,
        callback: React.useCallback(() => {
            setOpen(true);
        }, [setOpen]),
    });

    emitter.hook.useOn({
        type: emitter.events.TransactionResponse,
        callback: React.useCallback(() => {
            setOpen(false);
        }, [setOpen]),
    });

    const node = React.useRef<HTMLDivElement>(null);

    useOnClickOutside(node, () => setOpen(false));

    return peer && peer.type === 'walletconnect' && peer.deeplink_href ? (
        <>
            <animated.div
                // @ts-ignore

                style={{
                    ...trans,

                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'transparent',
                    pointerEvents: 'none',

                    overflow: 'hidden',
                    zIndex: 999000,
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        bottom: -80,
                        // width: '100%',
                        alignItems: 'center',
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        background: 'transparent',
                    }}
                >
                    <Button
                        className="mobile-pressable-div"
                        buttonStyle={{
                            position: 'absolute',
                            // boxShadow: '0 3px 5px rgba(80, 80, 80,1)',
                            bottom: 110,
                            // right: 30,
                            padding: 10,
                            pointerEvents: 'auto',
                            zIndex: 999000 + 1,
                            // textAlign: 'center',
                            background: 'white',
                            color: 'white',
                            borderRadius: lib.layout.borderRadius.medium,
                            boxShadow: lib.layout.boxShadow.basic,
                            width: 'auto',
                        }}
                        hoverStyle={{ filter: 'brightness(1)' }}
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            startTransiton(() => {
                                gotoDeepLink(peer.deeplink_href || '');
                            });
                        }}
                        // label="open"
                        size="largerish"
                        textStyle={{ color: lib.colors.primaryColor, marginLeft: 10 }}
                        leftIcon={<NLStaticImage image={`${peer.peer}_icon`} />}
                        rightIcon={
                            <div
                                ref={node}
                                style={{
                                    display: 'flex',
                                    alignItems: 'left',
                                    flexDirection: 'column',
                                    // width: '100%',
                                    marginLeft: 10,
                                }}
                            >
                                <Text textStyle={{ color: lib.colors.primaryColor }}>
                                    tap to open
                                </Text>
                                <Text
                                    textStyle={{
                                        color: lib.colors.primaryColor,
                                        fontSize: '24px',
                                    }}
                                >
                                    {peer.name}
                                </Text>
                            </div>
                        }
                    />
                </div>
            </animated.div>
        </>
    ) : null;
};

export default StupidMfingHack;
