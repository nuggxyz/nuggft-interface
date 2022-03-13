import { config as springConfig, useSpring, animated } from '@react-spring/web';
import React, { CSSProperties, FunctionComponent, useMemo } from 'react';

import AppState from '@src/state/app';
import Text, { TextProps } from '@src/components/general/Texts/Text/Text';
import client from '@src/client';
import { TokenId } from '@src/client/router';
import { parseTokenId } from '@src/lib';
import useOnHover from '@src/hooks/useOnHover';

import DangerouslySetNugg from './DangerouslySetNugg';

type Props = {
    tokenId: TokenId;
    style?: CSSProperties;
    showLabel?: boolean;
    labelColor?: string;
    textProps?: Omit<TextProps, 'children'>;
    // data?: Base64EncodedSvg;
    showcase?: boolean;
    labelLong?: boolean;
    disableOnClick?: boolean;
    checkForUpdates?: boolean;
};

const TokenViewer: FunctionComponent<Props> = ({
    tokenId,
    style,
    showLabel,
    labelColor,
    textProps,
    // data,
    showcase = false,
    labelLong = false,
    disableOnClick = false,
    checkForUpdates = false,
}) => {
    const screenType = AppState.select.screenType();

    const { width } = useMemo(() => {
        return { width: window.innerWidth };
    }, []);

    const src = checkForUpdates
        ? client.hook.useDotnugg(tokenId)
        : client.hook.useDotnuggCacheOnly(tokenId);

    const [hoverRef, isHovering] = useOnHover();

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
        // @ts-ignore
        <animated.div style={animatedStyle}>
            <div
                role="presentation"
                onClick={
                    disableOnClick
                        ? undefined
                        : () => {
                              client.actions.routeTo(tokenId, true);
                          }
                }
                ref={hoverRef}
                style={{
                    ...(screenType === 'phone'
                        ? { width: width / 1.2, height: width / 1.2 }
                        : { width: '400px', height: '400px' }),
                    // width: '100%',
                    ...style,
                    transform: 'translate3d(0,0,0)',
                    ...(isHovering ? { cursor: 'pointer' } : {}),
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
                        color: labelColor || 'black',
                    }}
                    {...textProps}
                >
                    {parseTokenId(tokenId, labelLong)}
                </Text>
            )}
        </animated.div>
    );
};

export default React.memo(TokenViewer, (prev, props) => prev.tokenId === props.tokenId);
