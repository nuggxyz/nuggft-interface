import React, { CSSProperties, FunctionComponent, useMemo } from 'react';
import { animated } from '@react-spring/web';

import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import useOnHover from '@src/hooks/useOnHover';
import NuggDexState from '@src/state/nuggdex';
import TokenState from '@src/state/token';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';

import styles from './NuggDexComponents.styles';

const NuggLinkThumbnail: FunctionComponent<{
    item: NL.GraphQL.Fragments.Nugg.ListItem;
    index: number;
    style?: CSSProperties;
}> = ({ item, index, style: customStyle }) => {
    const [ref, isHovering] = useOnHover();
    const selected = TokenState.select.tokenId();

    const style = useMemo(() => {
        return {
            ...styles.nuggLinkThumbnailContainer,
            ...(isHovering ? styles.hover : {}),
            ...(selected === item.id ? styles.selected : {}),
            ...customStyle,
        };
    }, [item, isHovering, selected, customStyle]);

    return (
        <animated.div
            ref={ref as any}
            key={index}
            style={style}
            onClick={() => {
                TokenState.dispatch.setNugg(item);
                NuggftV1Helper.storeNugg(item.id, item.dotnuggRawCache);
                NuggDexState.dispatch.addToRecents(item);
            }}
        >
            <TokenViewer tokenId={item.id || ''} style={styles.nugg} data={item.dotnuggRawCache} />
            <Text size="smaller" textStyle={styles.label}>
                {item.id}
            </Text>
        </animated.div>
    );
};

export default React.memo(NuggLinkThumbnail);
