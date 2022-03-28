import React, { FunctionComponent, PropsWithChildren, useCallback, useMemo, useRef } from 'react';
import { animated, useSpring } from '@react-spring/web';

import Text from '@src/components/general/Texts/Text/Text';
import constants from '@src/lib/constants';
import { ListData, SearchView } from '@src/client/interfaces';
import client from '@src/client';
import formatSearchFilter from '@src/client/formatters/formatSearchFilter';
import Label from '@src/components/general/Label/Label';
import AppState from '@src/state/app';

import styles from './NuggDexComponents.styles';
import NuggLinkAnchor from './NuggLinkAnchor';
import NuggLinkThumbnail from './NuggLinkThumbnail';

type Props = {
    type: SearchView;
    previewNuggs?: ListData[];
    style?: CSSPropertiesAnimated;
    limit?: number;
    disablePreview?: boolean;
};

const NuggLink: FunctionComponent<PropsWithChildren<Props>> = ({
    type,
    previewNuggs = [],
    style,
    limit = constants.NUGGDEX_DEFAULT_PREVIEW_COUNT,
    children,
    disablePreview = false,
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const viewing = client.live.searchFilter.viewing();
    const updateSearchFilterViewing = client.mutate.updateSearchFilterViewing();

    const toggled = useCallback(
        (toggVal: string | number, notToggVal: string | number) => {
            return viewing !== SearchView.Home
                ? viewing !== type
                    ? notToggVal
                    : toggVal
                : notToggVal;
        },
        [viewing, type],
    );
    const { opacityText, zIndex, ...animation } = useSpring({
        opacity: viewing === SearchView.Home || viewing === type ? 1 : 0,
        opacityText: viewing === type ? 0 : 1,
        height: toggled('100%', '45%'),
        width: toggled('100%', '45%'),
        zIndex: toggled(1, 0),
        transform: toggled(`scale(1.17) translate(20px, 20px)`, `scale(1)  translate(0px, 0px)`),
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
    const screenType = AppState.select.screenType();

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
            <animated.div
                style={{
                    ...styles.nuggLinkPreviewContainer,
                    ...(disablePreview && viewing === SearchView.Home ? { display: 'none' } : {}),
                }}
            >
                {!disablePreview && (
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
                                updateSearchFilterViewing(viewing === type ? SearchView.Home : type)
                            }
                            style={limit > 3 ? styles.nuggLinkThumbnailContainerBig : {}}
                        />
                    </animated.div>
                )}
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
            {!disablePreview && (
                <>
                    {screenType === 'phone' ? (
                        <Label
                            size="small"
                            textStyle={{
                                // ...styles.nuggLinkCategoryTitle,
                                opacity: opacityText,
                            }}
                            containerStyles={{
                                marginTop: '10px',
                            }}
                            text={formatSearchFilter(type)}
                        />
                    ) : (
                        <Text
                            size="small"
                            textStyle={{
                                ...styles.nuggLinkCategoryTitle,
                                opacity: opacityText,
                            }}
                        >
                            {formatSearchFilter(type)}
                        </Text>
                    )}
                </>
            )}
        </animated.div>
    );
};

export default React.memo(NuggLink);
