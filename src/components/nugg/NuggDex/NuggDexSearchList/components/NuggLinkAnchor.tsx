import React, { FunctionComponent } from 'react';
import { animated } from 'react-spring';
import { Maximize2 } from 'react-feather';

import useOnHover from '../../../../../hooks/useOnHover';
import Text from '../../../../general/Texts/Text/Text';
import globalStyles from '../../../../../lib/globalStyles';

import styles from './NuggDexComponents.styles';

type Props = {
    onClick: () => void;
};

const NuggThumbnail: FunctionComponent<Props> = ({ onClick }) => {
    const [ref, isHovering] = useOnHover();

    return (
        <animated.div
            ref={ref as any}
            style={{
                ...styles.nuggLinkThumbnailContainer,
                ...(isHovering ? styles.hover : {}),
                justifyContent: 'space-evenly',
            }}
            onClick={onClick}>
            <Maximize2 style={globalStyles.fillWidth} />
            <Text size="smaller" textStyle={styles.label}>
                MORE
            </Text>
        </animated.div>
    );
};

export default NuggThumbnail;
