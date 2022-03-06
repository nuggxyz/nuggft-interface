import { animated } from '@react-spring/web';
import React, { FunctionComponent, useCallback } from 'react';

import NuggDexSearchList from '@src/components/nugg/NuggDex/NuggDexSearchList/NuggDexSearchList';
import ViewingNugg from '@src/components/nugg/ViewingNugg/ViewingNugg';
import useAnimateOverlay from '@src/hooks/useAnimateOverlay';
import AppState from '@src/state/app';
import client from '@src/client';

import styles from './SearchOverlay.styles';

type Props = {};

const SearchOverlay: FunctionComponent<Props> = () => {
    const screenType = AppState.select.screenType();

    const router = client.router.useRouter();

    const onClick = useCallback(
        () => (router.isViewOpen ? router.toggleView() : undefined),
        [router.isViewOpen],
    );
    const style = useAnimateOverlay(router.isViewOpen, {
        zIndex: 997,
        ...styles.container,
    });
    return (
        <animated.div style={{ ...styles.container, ...style }} onClick={onClick}>
            <div
                style={{
                    ...styles.nuggDexContainer,
                    ...(screenType === 'tablet' ? { width: '50%' } : {}),
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <NuggDexSearchList />
            </div>
            <div
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
