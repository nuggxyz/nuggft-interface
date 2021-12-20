import React, { FunctionComponent, useMemo } from 'react';
import { animated } from 'react-spring';

import useOnHover from '../../../../../hooks/useOnHover';
import NuggDexState from '../../../../../state/nuggdex';
import TokenDispatches from '../../../../../state/token/dispatches';
import TokenSelectors from '../../../../../state/token/selectors';
import Text from '../../../../general/Texts/Text/Text';
import TokenViewer from '../../../TokenViewer';

import styles from './NuggDexComponents.styles';

const NuggLinkThumbnail: FunctionComponent<{
    item: string;
    index: number;
}> = ({ item, index }) => {
    const [ref, isHovering] = useOnHover();
    const selected = TokenSelectors.tokenId();

    const style = useMemo(() => {
        return {
            ...styles.nuggLinkThumbnailContainer,
            ...(isHovering ? styles.hover : {}),
            ...(selected === item ? styles.selected : {}),
        };
    }, [item, isHovering, selected]);

    return (
        <animated.div
            ref={ref as any}
            key={index}
            style={style}
            onClick={() => {
                TokenDispatches.setTokenFromId(item);
                NuggDexState.dispatch.addToRecents({
                    _localStorageValue: item,
                    _localStorageTarget: 'recents',
                    _localStorageExpectedType: 'array',
                });
            }}>
            <TokenViewer tokenId={item || ''} style={styles.nugg} />
            <Text size="smaller" textStyle={styles.label}>
                {item}
            </Text>
        </animated.div>
    );
};

export default React.memo(NuggLinkThumbnail);
