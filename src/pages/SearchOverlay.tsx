import { animated } from '@react-spring/web';
import React, { FunctionComponent } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

import NuggDexSearchList from '@src/components/nugg/NuggDex/NuggDexSearchList/NuggDexSearchList';
import useBlur from '@src/hooks/useBlur';
import ViewingNugg from '@src/components/nugg/ViewingNugg/ViewingNugg';
import { NLStyleSheetCreator } from '@src/lib';
import client from '@src/client';
import useDimentions from '@src/client/hooks/useDimentions';
import BackButton from '@src/components/mobile/BackButton';
import { useOverlayRouteStyle } from '@src/lib/router';

type Props = Record<string, never>;

const styles = NLStyleSheetCreator({
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'space-between',
        zIndex: 997,
        backdropFilter: 'blur(10)',
    },
    nuggDexContainer: {
        display: 'flex',
        width: '45%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tokenContainer: {
        display: 'flex',
        width: '45%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'scroll',
    },
});

const SearchOverlay: FunctionComponent<Props> = () => {
    const { screen: screenType } = useDimentions();

    const isPageLoaded = client.live.pageIsLoaded();

    const setPageIsLoaded = client.mutate.setPageIsLoaded();

    const navigate = useNavigate();
    const lastSwap = client.live.lastSwap.tokenId();

    const visible = useMatch('/view/*');

    // this slows the rendering to a normal timeframe depending on how the user gets here
    // if the SearchOverlay was viewable from the beggining, we go ahead and render everything (setPageIsLoaded to true with no timeout)
    // if this is not the case, we delay the render by 500ms to reduce the lurching in
    const [wasNotVisible] = React.useState(visible === null);

    React.useEffect(() => {
        if (!isPageLoaded && visible) setTimeout(() => setPageIsLoaded(), wasNotVisible ? 500 : 0);
    }, [visible, isPageLoaded, setPageIsLoaded, wasNotVisible]);

    const blur = useBlur(['/view/*']);

    const overlay = useOverlayRouteStyle();

    // const overlay = useAnimateOverlay(true, {
    //     zIndex: 997,
    // });

    return screenType === 'phone' ? (
        <>
            <animated.div
                style={{
                    // ...blur,
                    ...overlay,
                    ...styles.container,
                }}
                // onClick={() => {
                //     if (visible) {
                //         if (lastSwap) navigate(`/swap/${lastSwap}`);
                //         else navigate('/');
                //     }
                // }}
            >
                <BackButton to="/live" />
                <div
                    aria-hidden="true"
                    role="button"
                    style={{
                        ...styles.nuggDexContainer,
                        alignItems: 'center',
                        width: '100%',
                        padding: '20px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <NuggDexSearchList />
                </div>
            </animated.div>
        </>
    ) : (
        <animated.div
            style={{
                ...blur,
                ...overlay,
                ...styles.container,
            }}
            onClick={() => {
                if (visible) {
                    if (lastSwap) navigate(`/swap/${lastSwap}`);
                    else navigate('/');
                }
            }}
        >
            <div
                aria-hidden="true"
                role="button"
                style={{
                    ...styles.nuggDexContainer,
                    ...(screenType === 'tablet' ? { width: '50%' } : {}),
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <NuggDexSearchList />
            </div>
            <div
                aria-hidden="true"
                role="button"
                style={{
                    ...styles.tokenContainer,
                    ...(screenType === 'tablet' ? { width: '50%' } : {}),
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <ViewingNugg />
            </div>
        </animated.div>
    );
};

export default SearchOverlay;
