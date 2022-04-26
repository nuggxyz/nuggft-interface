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
            delay: 0,
            config: config.default,
        },
        [open],
    );

    emitter.hook.useOn({
        type: emitter.events.TransactionSent,
        callback: React.useCallback(() => {
            setOpen(true);
            setTimeout(() => {
                setOpen(false);
            }, 10000);
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

                    overflow: 'hidden',
                    zIndex: 9900000,
                }}
            >
                {/* <animated.div
                    style={{
                        height: '100%',
                        width: '90%',
                        // background: 'white',

                        // boxShadow: '0 6px 10px rgba(80, 80, 80,1)',
                        // background: lib.colors.white,
                        borderTopLeftRadius: lib.layout.borderRadius.largish,
                        borderTopRightRadius: lib.layout.borderRadius.largish,
                        position: 'absolute',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'transparent',
                    }}
                > */}

                <Button
                    buttonStyle={{
                        position: 'absolute',
                        // boxShadow: '0 3px 5px rgba(80, 80, 80,1)',
                        bottom: 30,
                        // right: 30,
                        padding: 10,

                        zIndex: 100002,
                        background: 'white',
                        color: 'white',
                        borderRadius: lib.layout.borderRadius.medium,
                    }}
                    hoverStyle={{ filter: 'brightness(1)' }}
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        startTransiton(() => {
                            gotoDeepLink(peer.deeplink_href || '');
                        });
                    }}
                    rightIcon={
                        <div
                            ref={node}
                            style={{
                                width: '100%',
                                display: 'flex',
                                height: '100%',
                                alignItems: 'center',
                            }}
                        >
                            {peer && <NLStaticImage image={`${peer.peer}_icon`} />}
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    marginLeft: 10,
                                    height: '100%',
                                    justifyContent: 'center',
                                }}
                            >
                                <Text size="small" textStyle={{ color: lib.colors.primaryColor }}>
                                    having trouble?
                                </Text>
                                <Text
                                    textStyle={{ color: lib.colors.primaryColor }}
                                >{`tap to open ${peer.name}`}</Text>
                            </div>
                        </div>
                    }
                />
                {/* <div
                    style={{
                        position: 'absolute',
                        zIndex: 100003,
                        top: -30,
                        display: 'flex',
                        alignItems: 'center',
                        opacity: 0.8,
                    }}
                >
                    <Text size="small">tap anywhere to close</Text>
                </div> */}
            </animated.div>
            {/* </animated.div> */}
        </>
    ) : null;
};

export default StupidMfingHack;
