import React, { CSSProperties, Dispatch, FunctionComponent, SetStateAction } from 'react';
import { animated, useSpring } from 'react-spring';

import { ucFirst } from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';

import styles from './NuggDexComponents.styles';
import NuggLinkAnchor from './NuggLinkAnchor';
import NuggLinkThumbnail from './NuggLinkThumbnail';

type Props = {
    type: NL.Redux.NuggDex.SearchViews;
    localViewing: NL.Redux.NuggDex.SearchViews;
    previewNuggs: NL.GraphQL.Fragments.Nugg.ListItem[];
    setRef: Dispatch<SetStateAction<HTMLDivElement>>;
    onClick: Dispatch<SetStateAction<NL.Redux.NuggDex.SearchViews>>;
    style?: CSSProperties;
    limit?: number;
};

const NuggLink: FunctionComponent<Props> = ({
    type,
    previewNuggs,
    localViewing,
    setRef,
    onClick,
    style,
    limit = 3,
}) => {
    // const viewing = NuggDexState.select.viewing();
    const opacity = useSpring({
        opacity: localViewing !== 'home' ? 0 : 1,
        transform:
            localViewing !== 'home'
                ? localViewing !== type
                    ? 'scale(1)'
                    : 'scale(1.2)'
                : 'scale(1)',
    });

    return (
        <animated.div style={{ ...styles.nuggLinkContainer, ...opacity, ...style }}>
            <animated.div
                ref={(ref) => localViewing === type && setRef(ref)}
                style={{
                    ...styles.nuggLinkPreviewContainer,
                }}>
                {previewNuggs.first(limit).map(
                    (nugg, i) =>
                        nugg && (
                            <NuggLinkThumbnail
                                item={nugg}
                                index={i}
                                key={i}
                                style={{
                                    ...(limit > 3 ? styles.nuggLinkThumbnailContainerBig : {}),
                                }}
                            />
                        ),
                )}
                <NuggLinkAnchor
                    onClick={() => onClick(type)}
                    style={{
                        ...(limit > 3 ? styles.nuggLinkThumbnailContainerBig : {}),
                    }}
                />
            </animated.div>
            <Text size="small" textStyle={styles.nuggLinkCategoryTitle}>
                {ucFirst(type)}
            </Text>
        </animated.div>
    );
};

export default React.memo(NuggLink);
