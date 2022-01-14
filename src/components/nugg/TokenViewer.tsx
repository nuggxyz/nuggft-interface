import { config, useSpring } from '@react-spring/core';
import { animated } from '@react-spring/web';
import React, {
    CSSProperties,
    FunctionComponent,
    useCallback,
    useLayoutEffect,
    useMemo,
    useState,
} from 'react';

import pendingToken from '../../assets/images/pending-token.svg';
import NuggftV1Helper from '../../contracts/NuggftV1Helper';
import { isUndefinedOrNullOrStringEmpty } from '../../lib';
import AppState from '../../state/app';
import Text, { TextProps } from '../general/Texts/Text/Text';

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
    const { width } = useMemo(() => {
        return { width: window.innerWidth };
    }, []);
    const [src, setSrc] = useState<any>(pendingToken);

    useLayoutEffect(() => {
        let unmounted = false;
        const getDotNuggSrc = async () => {
            if (!isUndefinedOrNullOrStringEmpty(tokenId)) {
                const dotNuggData = !isUndefinedOrNullOrStringEmpty(data)
                    ? data
                    : await NuggftV1Helper.optimizedDotNugg(tokenId);
                if (
                    !isUndefinedOrNullOrStringEmpty(dotNuggData) &&
                    !unmounted
                ) {
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
        config: config.default,
    });

    return (
        //@ts-ignore
        <animated.div style={animatedStyle}>
            <img
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

export default React.memo(
    TokenViewer,
    (prev, props) => prev.tokenId === props.tokenId,
);
