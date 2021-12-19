import React, { Dispatch, FunctionComponent, SetStateAction } from 'react';
import { animated, useSpring } from 'react-spring';

import { ucFirst } from '../../../../../lib';
import NuggDexState from '../../../../../state/nuggdex';
import Text from '../../../../general/Texts/Text/Text';

import styles from './NuggDexComponents.styles';
import NuggLinkAnchor from './NuggLinkAnchor';
import NuggLinkThumbnail from './NuggLinkThumbnail';

type Props = {
    type: NL.Redux.NuggDex.SearchViews;
    previewNuggs: string[];
    setRef: Dispatch<SetStateAction<HTMLDivElement>>;
};

const NuggLink: FunctionComponent<Props> = ({ type, previewNuggs, setRef }) => {
    const viewing = NuggDexState.select.viewing();
    const opacity = useSpring({
        opacity: viewing !== 'home' ? 0 : 1,
        transform:
            viewing !== 'home'
                ? viewing !== type
                    ? 'scale(1)'
                    : 'scale(1.2)'
                : 'scale(1)',
    });

    return (
        <animated.div style={{ ...styles.nuggLinkContainer, ...opacity }}>
            <animated.div
                ref={(ref) => viewing === type && setRef(ref)}
                style={{ ...styles.nuggLinkPreviewContainer }}>
                {previewNuggs
                    .first(3)
                    .map(
                        (nugg, i) =>
                            nugg && (
                                <NuggLinkThumbnail
                                    item={nugg}
                                    index={i}
                                    key={i}
                                />
                            ),
                    )}
                <NuggLinkAnchor
                    onClick={() => NuggDexState.dispatch.setViewing(type)}
                />
            </animated.div>
            <Text size="smaller" textStyle={styles.nuggLinkCategoryTitle}>
                {ucFirst(type)}
            </Text>
        </animated.div>
    );
};

export default NuggLink;
