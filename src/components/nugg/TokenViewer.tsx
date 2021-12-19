import { config, useSpring } from '@react-spring/core';
import { animated } from '@react-spring/web';
import React, {
    CSSProperties,
    FunctionComponent,
    useCallback,
    useLayoutEffect,
    useState,
} from 'react';

import pendingToken from '../../assets/images/pending-token.svg';
import NuggFTHelper from '../../contracts/NuggFTHelper';
import { isUndefinedOrNullOrStringEmpty } from '../../lib';
import Text from '../general/Texts/Text/Text';

type Props = {
    tokenId: string;
    style?: CSSProperties;
    showLabel?: boolean;
    labelColor?: string;
};

const TokenViewer: FunctionComponent<Props> = ({
    tokenId,
    style,
    showLabel,
    labelColor,
}) => {
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
                style={{ width: '400px', height: '400px', ...style }}
                src={src}
            />
            {showLabel && (
                <Text
                    textStyle={{
                        textAlign: 'center',
                        color: labelColor ? labelColor : 'black',
                    }}>
                    NuggFT #{tokenId}
                </Text>
            )}
        </animated.div>
    );
};

export default TokenViewer;
