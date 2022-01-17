import React, { CSSProperties, FunctionComponent } from 'react';
import { animated } from 'react-spring';
import { Maximize2 } from 'react-feather';

import useOnHover from '../../../../../hooks/useOnHover';
import Text from '../../../../general/Texts/Text/Text';
import globalStyles from '../../../../../lib/globalStyles';
import Colors from '../../../../../lib/colors';

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
            <Maximize2 style={{ ...globalStyles.fillWidth, height: '60px' }} />
            <Text size="smaller" textStyle={styles.label}>
                MORE
            </Text>
        </animated.div>
    );
};

export default NuggThumbnail;
