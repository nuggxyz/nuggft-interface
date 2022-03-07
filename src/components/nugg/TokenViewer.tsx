import { config as springConfig, useSpring } from '@react-spring/core';
import { animated } from '@react-spring/web';
import React, { CSSProperties, FunctionComponent, useMemo } from 'react';

import AppState from '@src/state/app';
import Text, { TextProps } from '@src/components/general/Texts/Text/Text';
import client from '@src/client';
import { TokenId } from '@src/client/router';

import DangerouslySetNugg from './DangerouslySetNugg';
type Props = {
    tokenId: TokenId;
    style?: CSSProperties;
    showLabel?: boolean;
    labelColor?: string;
    textProps?: Omit<TextProps, 'children'>;
    data?: Base64EncodedSvg;
    showcase?: boolean;
};

const TokenViewer: FunctionComponent<Props> = ({
    tokenId,
    style,
    showLabel,
    labelColor,
    textProps,
    data,
    showcase = false,
}) => {
    const screenType = AppState.select.screenType();
    // const chainId = web3.hook.usePriorityChainId();
    // const app = state.app.select.userAgent()

    const { width } = useMemo(() => {
        return { width: window.innerWidth };
    }, []);

    const src = client.hook.useDotnugg(tokenId, data);

    const animatedStyle = useSpring({
        to: {
            // ...style,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            opacity: tokenId ? 1 : 0,
        },
        config: springConfig.default,
    });

    return (
        //@ts-ignore
        <animated.div style={animatedStyle}>
            <div
                role="presentation"
                style={{
                    ...(screenType === 'phone'
                        ? { width: width / 1.2, height: width / 1.2 }
                        : { width: '400px', height: '400px' }),
                    // width: '100%',
                    ...style,
                    transform: 'translate3d(0,0,0)',
                }}
            >
                {src && (
                    <DangerouslySetNugg imageUri={src} size={showcase ? 'showcase' : 'thumbnail'} />
                )}
            </div>
            {showLabel && (
                <Text
                    textStyle={{
                        textAlign: 'center',
                        color: labelColor ? labelColor : 'black',
                    }}
                    {...textProps}
                >
                    Nugg #{tokenId}
                </Text>
            )}
        </animated.div>
    );
};

export default React.memo(TokenViewer, (prev, props) => prev.tokenId === props.tokenId);
