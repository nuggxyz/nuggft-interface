import React, { FunctionComponent, PropsWithChildren, useCallback, useMemo, useRef } from 'react';
import { animated, useSpring } from '@react-spring/web';

import { ucFirst } from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import NuggDexState from '@src/state/nuggdex';
import constants from '@src/lib/constants';

import styles from './NuggDexComponents.styles';
import NuggLinkAnchor from './NuggLinkAnchor';
import NuggLinkThumbnail from './NuggLinkThumbnail';

type Props = {
    type: NuggDexSearchViews;
    previewNuggs: NL.GraphQL.Fragments.Nugg.ListItem[];
    style?: CSSPropertiesAnimated;
    limit?: number;
};

const NuggLink: FunctionComponent<PropsWithChildren<Props>> = ({
    type,
    previewNuggs = [],
    style,
    limit = constants.NUGGDEX_DEFAULT_PREVIEW_COUNT,
    children,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const viewing = NuggDexState.select.viewing();
    const toggled = useCallback(
        (toggVal: string | number, notToggVal: string | number) => {
            // eslint-disable-next-line no-nested-ternary
            return viewing !== 'home' ? (viewing !== type ? notToggVal : toggVal) : notToggVal;
        },
        [viewing, type],
    );
    const { opacityText, zIndex, ...animation } = useSpring({
        opacity: viewing === 'home' || viewing === type ? 1 : 0,
        opacityText: viewing === type ? 0 : 1,
        height: toggled('100%', '45%'),
        width: toggled('100%', '45%'),
        zIndex: toggled(1, 0),
        transform: toggled(`scale(1.2) translate(20px, 40px)`, `scale(1)  translate(0px, 0px)`),
        delay: constants.ANIMATION_DELAY,
        // config: constants.ANIMATION_CONFIG,
    });

    const previewNuggsStable = useMemo(() => {
        return previewNuggs
            .first(limit)
            .map(
                (nugg, i) =>
                    nugg && (
                        <NuggLinkThumbnail
                            item={nugg}
                            index={i}
                            key={nugg.id}
                            style={limit > 3 ? styles.nuggLinkThumbnailContainerBig : {}}
                        />
                    ),
            );
    }, [previewNuggs, limit]);

    return (
        <animated.div
            ref={ref}
            // @ts-ignore
            style={{
                ...styles.nuggLinkContainer,
                ...animation,
                ...style,
                zIndex,
            }}
        >
            <animated.div style={styles.nuggLinkPreviewContainer}>
                <animated.div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        opacity: opacityText,
                        zIndex: zIndex.to({
                            range: [0, 1],
                            output: [1, 0],
                        }),
                        ...styles.nuggLinkItemsContainer,
                    }}
                >
                    {previewNuggsStable}
                    <NuggLinkAnchor
                        onClick={() =>
                            NuggDexState.dispatch.setViewing(viewing === type ? 'home' : type)
                        }
                        style={limit > 3 ? styles.nuggLinkThumbnailContainerBig : {}}
                    />
                </animated.div>
                <animated.div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        zIndex,
                        opacity: opacityText.to({
                            range: [0, 1],
                            output: [1, 0],
                        }),
                    }}
                >
                    {children}
                </animated.div>
            </animated.div>
            <Text
                size="small"
                textStyle={{
                    ...styles.nuggLinkCategoryTitle,
                    opacity: opacityText,
                }}
            >
                {ucFirst(type)}
            </Text>
        </animated.div>
    );
};

export default React.memo(NuggLink);
