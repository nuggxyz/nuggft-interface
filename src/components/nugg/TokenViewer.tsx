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
import NuggFTHelper from '../../contracts/NuggFTHelper';
import { isUndefinedOrNullOrStringEmpty } from '../../lib';
import AppState from '../../state/app';
import Text, { TextProps } from '../general/Texts/Text/Text';

type Props = {
    tokenId: string;
    style?: CSSProperties;
    showLabel?: boolean;
    labelColor?: string;
    textProps?: Omit<TextProps, 'children'>;
};

const TokenViewer: FunctionComponent<Props> = ({
    tokenId,
    style,
    showLabel,
    labelColor,
    textProps,
}) => {
    const { width, height } = useMemo(() => {
        return { width: window.innerWidth, height: window.innerHeight };
    }, []);
    const [src, setSrc] = useState<any>(pendingToken);
    const getDotNuggSrc = useCallback(async () => {
        if (!isUndefinedOrNullOrStringEmpty(tokenId)) {
            const dotNuggData = await NuggFTHelper.optimizedDotNugg(tokenId);
            setSrc(
                dotNuggData
                    ? `data:image/svg+xml;base64,${btoa(dotNuggData)}`
                    : pendingToken,
            );
        } else {
            setSrc(pendingToken);
        }
    }, [tokenId]);

    useLayoutEffect(() => {
        getDotNuggSrc();
    }, [getDotNuggSrc]);

    const animatedStyle = useSpring({
        to: {
            // ...style,
            position: 'relative',
            opacity: tokenId ? 1 : 0,
        },
        config: config.default,
    });

    return (
        //@ts-ignore
        <animated.div style={animatedStyle}>
            <img
                style={{
                    ...(AppState.isMobile
                        ? { width: width / 1.2, height: width / 1.2 }
                        : { width: '400px', height: '400px' }),
                    ...style,
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

export default React.memo(TokenViewer);
