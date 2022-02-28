import React, {
    CSSProperties,
    FunctionComponent,
    PropsWithChildren,
    useCallback,
    useRef,
} from 'react';
import { animated, useSpring, WithAnimated } from '@react-spring/web';

import { ucFirst } from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import NuggDexState from '@src/state/nuggdex';

import styles from './NuggDexComponents.styles';
import NuggLinkAnchor from './NuggLinkAnchor';
import NuggLinkThumbnail from './NuggLinkThumbnail';

type Props = {
    type: NL.Redux.NuggDex.SearchViews;
    previewNuggs: NL.GraphQL.Fragments.Nugg.ListItem[];
    style?: CSSProperties | WithAnimated;
    limit?: number;
};

const NuggLink: FunctionComponent<PropsWithChildren<Props>> = ({
    type,
    previewNuggs,
    style,
    limit = 3,
    children,
}) => {
    const ref = useRef<HTMLDivElement>();
    const viewing = NuggDexState.select.viewing();
    const toggled = useCallback(
        (toggVal, notToggVal) => {
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
    });

    return (
        <animated.div
            ref={ref}
            //@ts-ignore
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
                    {previewNuggs
                        .first(limit)
                        .map(
                            (nugg, i) =>
                                nugg && (
                                    <NuggLinkThumbnail
                                        item={nugg}
                                        index={i}
                                        key={i}
                                        style={
                                            limit > 3 ? styles.nuggLinkThumbnailContainerBig : {}
                                        }
                                    />
                                ),
                        )}
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
                        zIndex: zIndex,
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
