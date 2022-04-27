import React, { FunctionComponent, PropsWithChildren, useCallback, useMemo, useRef } from 'react';
import { animated, useSpring } from '@react-spring/web';

import Text from '@src/components/general/Texts/Text/Text';
import constants from '@src/lib/constants';
import { SearchView } from '@src/client/interfaces';
import client from '@src/client';
import formatSearchFilter from '@src/client/formatters/formatSearchFilter';
import Label from '@src/components/general/Label/Label';
import useDimentions from '@src/client/hooks/useDimentions';
import Loader from '@src/components/general/Loader/Loader';

import styles from './NuggDexComponents.styles';
import NuggLinkAnchor from './NuggLinkAnchor';
import NuggLinkThumbnail from './NuggLinkThumbnail';

type Props = {
    type: SearchView;
    previewNuggs?: TokenId[];
    style?: CSSPropertiesAnimated;
    limit?: number;
    disablePreview?: boolean;
};

const FullPageLoader = () => (
    <div
        style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        <Loader />
    </div>
);

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
        transform: toggled(`scale(1.155) translate(0px, 15px)`, `scale(1)  translate(0px, 0px)`),
        delay: constants.ANIMATION_DELAY,
        // config: constants.ANIMATION_CONFIG,
    });

    const isPageLoaded = client.live.pageIsLoaded();

    const previewNuggsStable = useMemo(() => {
        return previewNuggs
            .first(limit)
            .map(
                (tokenId, i) =>
                    tokenId && (
                        <NuggLinkThumbnail
                            tokenId={tokenId}
                            index={i}
                            key={`NuggLinkThumbnail-${tokenId}-${i}`}
                            style={limit > 3 ? styles.nuggLinkThumbnailContainerBig : {}}
                        />
                    ),
            );
    }, [previewNuggs, limit]);
    const { screen: screenType, isPhone } = useDimentions();

    return (
        <animated.div
            ref={ref}
            // @ts-ignore
            style={{
                ...styles.nuggLinkContainer,
                // justifyContent: 'flex-start',
                ...animation,
                ...style,
                zIndex,
            }}
        >
            <animated.div
                style={{
                    ...styles.nuggLinkPreviewContainer,
                    ...(isPhone && viewing !== SearchView.Home && { background: 'transparent' }),
                    ...(disablePreview && viewing !== type ? { display: 'none' } : {}),
                }}
            >
                {isPageLoaded ? (
                    <>
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
                                        updateSearchFilterViewing(
                                            viewing === type ? SearchView.Home : type,
                                        )
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
                    </>
                ) : (
                    <FullPageLoader />
                )}
            </animated.div>
            {!disablePreview && (
                <>
                    {screenType === 'phone' ? (
                        <Label
                            size="small"
                            containerStyles={{
                                marginTop: '10px',
                                opacity: opacityText.get(),
                            }}
                            text={formatSearchFilter(type)}
                        />
                    ) : (
                        <Text
                            size="small"
                            textStyle={{
                                ...styles.nuggLinkCategoryTitle,
                                opacity: opacityText.get(),
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
