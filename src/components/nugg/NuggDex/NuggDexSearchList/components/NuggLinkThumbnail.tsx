import React, { CSSProperties, FunctionComponent, useMemo } from 'react';
import { animated } from '@react-spring/web';

import useOnHover from '@src/hooks/useOnHover';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import { parseTokenIdSmart } from '@src/lib';
import client from '@src/client';
import { ListData } from '@src/client/interfaces';

import styles from './NuggDexComponents.styles';

const NuggLinkThumbnail: FunctionComponent<{
    item: ListData;
    index: number;
    style?: CSSProperties;
}> = ({ item, index, style: customStyle }) => {
    const [ref, isHovering] = useOnHover();
    const lastView__tokenId = client.live.lastView.tokenId();

    const style = useMemo(() => {
        return {
            ...styles.nuggLinkThumbnailContainer,
            ...(isHovering ? styles.hover : {}),
            ...(lastView__tokenId === item.id ? styles.selected : {}),
            ...customStyle,
        };
    }, [item, isHovering, lastView__tokenId, customStyle]);

    return (
        <animated.div
            ref={ref}
            key={index}
            style={{ ...style }}
            onClick={() => {
                client.actions.routeTo(item?.id, true);
            }}
        >
            <TokenViewer tokenId={item.id} style={styles.nugg} disableOnClick />
            <Text size="smaller" textStyle={styles.label}>
                {parseTokenIdSmart(item.id)}
            </Text>
        </animated.div>
    );
};

export default React.memo(NuggLinkThumbnail);
