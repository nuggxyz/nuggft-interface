import { config as springConfig, useSpring } from '@react-spring/core';
import { animated } from '@react-spring/web';
import React, { CSSProperties, FunctionComponent, useLayoutEffect, useMemo, useState } from 'react';

import pendingToken from '@src/assets/images/pending-token.svg';
import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import {
    isUndefinedOrNullOrStringEmpty,
    isUndefinedOrNullOrStringEmptyOrZeroOrStringZero,
} from '@src/lib';
import AppState from '@src/state/app';
import Text, { TextProps } from '@src/components/general/Texts/Text/Text';
import config from '@src/web3/config';

type Props = {
    tokenId: string;
    style?: CSSProperties;
    showLabel?: boolean;
    labelColor?: string;
    textProps?: Omit<TextProps, 'children'>;
    data?: string;
};

const TokenViewer: FunctionComponent<Props> = ({
    tokenId,
    style,
    showLabel,
    labelColor,
    textProps,
    data,
}) => {
    const screenType = AppState.select.screenType();
    const chainId = config.priority.usePriorityChainId();

    const { width } = useMemo(() => {
        return { width: window.innerWidth };
    }, []);
    const [src, setSrc] = useState<any>(pendingToken);

    useLayoutEffect(() => {
        let unmounted = false;
        const getDotNuggSrc = async () => {
            if (!isUndefinedOrNullOrStringEmptyOrZeroOrStringZero(tokenId)) {
                const dotNuggData = !isUndefinedOrNullOrStringEmpty(data)
                    ? data
                    : await NuggftV1Helper.optimizedDotNugg(chainId, tokenId);
                if (!isUndefinedOrNullOrStringEmpty(dotNuggData) && !unmounted) {
                    setSrc(dotNuggData);
                }
            }
        };
        getDotNuggSrc();
        return () => {
            unmounted = true;
        };
    }, [tokenId, data]);

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
            <img
                role="presentation"
                style={{
                    ...(screenType === 'phone'
                        ? { width: width / 1.2, height: width / 1.2 }
                        : { width: '400px', height: '400px' }),
                    // width: '100%',
                    ...style,
                    transform: 'translate3d(0,0,0)',
                }}
                src={src}
            />
            {showLabel && (
                <Text
                    textStyle={{
                        textAlign: 'center',
                        color: labelColor ? labelColor : 'black',
                    }}
                    {...textProps}>
                    Nugg #{tokenId}
                </Text>
            )}
        </animated.div>
    );
};

export default React.memo(TokenViewer, (prev, props) => prev.tokenId === props.tokenId);
