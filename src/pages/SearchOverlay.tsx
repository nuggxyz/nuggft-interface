import { animated } from '@react-spring/web';
import React, { FunctionComponent, useMemo } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

import MobileViewOverlay from '@src/pages/mobile/MobileViewOverlay';
import NuggDexSearchList from '@src/components/nugg/NuggDex/NuggDexSearchList/NuggDexSearchList';
import AppState from '@src/state/app';
import useBlur from '@src/hooks/useBlur';
import ViewingNugg from '@src/components/nugg/ViewingNugg/ViewingNugg';
import lib, { NLStyleSheetCreator } from '@src/lib';
import { useOverlayRouteStyleWithOverride } from '@src/lib/router';
import client from '@src/client';

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
        width: '40%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tokenContainer: {
        display: 'flex',
        width: '40%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'scroll',
    },
});

const SearchOverlay: FunctionComponent<Props> = () => {
    // const overlay = useOverlayRouteStyle();

    const screenType = AppState.select.screenType();

    const navigate = useNavigate();
    const lastSwap = client.live.lastSwap.tokenId();

    const paramMatch = useMatch(`/view/${lib.constants.VIEWING_PREFIX}/*`);
    const visible = useMatch('/view/*');

    const blur = useBlur(['/view/*']);

    const showMobileOverlay = useMemo(() => {
        return screenType === 'phone' && !!paramMatch;
    }, [paramMatch, screenType]);

    const overlay = useOverlayRouteStyleWithOverride(showMobileOverlay);

    return screenType === 'phone' ? (
        <>
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
                        alignItems: 'center',
                        width: '100%',
                        padding: '20px',
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <NuggDexSearchList />
                </div>
            </animated.div>
            {showMobileOverlay && <MobileViewOverlay />}
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
