import React, { CSSProperties, FunctionComponent } from 'react';
import { animated } from '@react-spring/web';
import { Maximize2 } from 'react-feather';

import useOnHover from '@src/hooks/useOnHover';
import Text from '@src/components/general/Texts/Text/Text';
import globalStyles from '@src/lib/globalStyles';

import styles from './NuggDexComponents.styles';

type Props = {
    onClick: () => void;
    style?: CSSProperties;
};

const NuggThumbnail: FunctionComponent<Props> = ({ onClick, style }) => {
    const [ref, isHovering] = useOnHover();

    return (
        <animated.div
            ref={ref as any}
            style={{
                ...styles.nuggLinkThumbnailContainer,
                ...(isHovering ? styles.hover : {}),
                ...style,
                justifyContent: 'space-evenly',
            }}
            onClick={onClick}>
            <Maximize2
                style={{
                    ...globalStyles.fillWidth,
                    height: '30px',
                    margin: '15px 0px',
                }}
            />
            <Text size="smaller" textStyle={styles.label}>
                MORE
            </Text>
        </animated.div>
    );
};

export default NuggThumbnail;
