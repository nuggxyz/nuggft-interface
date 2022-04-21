import React, { CSSProperties, FunctionComponent, useMemo } from 'react';
import { animated } from '@react-spring/web';

import useOnHover from '@src/hooks/useOnHover';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import { ListData } from '@src/client/interfaces';
import useDimentions from '@src/client/hooks/useDimentions';
import useViewingNugg from '@src/client/hooks/useViewingNugg';

import styles from './NuggDexComponents.styles';

const NuggLinkThumbnail: FunctionComponent<{
    item: ListData;
    index: number;
    style?: CSSProperties;
}> = ({ item, index, style: customStyle }) => {
    const [ref, isHovering] = useOnHover();

    const style = useMemo(() => {
        return {
            ...styles.nuggLinkThumbnailContainer,
            ...(isHovering ? styles.hover : {}),
            // ...(lastView__tokenId === item.tokenId ? styles.selected : {}),
            ...customStyle,
        };
    }, [item, isHovering, customStyle]);
    const { screen: screenType } = useDimentions();

    const { gotoViewingNugg } = useViewingNugg();
    // const pageLoaded = client.live.pageIsLoaded();

    return (
        <animated.div
            ref={ref}
            key={index}
            style={{ ...style }}
            onClick={() => {
                gotoViewingNugg(item.tokenId);
            }}
        >
            <TokenViewer
                tokenId={item.tokenId}
                style={styles.nugg}
                disableOnClick
                // shouldLoad={pageLoaded}
            />
            {screenType !== 'phone' && (
                <Text size="smaller" textStyle={styles.label}>
                    {item.tokenId.toPrettyId()}
                </Text>
            )}
        </animated.div>
    );
};

export default React.memo(NuggLinkThumbnail);
