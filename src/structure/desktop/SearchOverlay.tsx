import { animated } from '@react-spring/web';
import React, { FunctionComponent, useCallback } from 'react';

import NuggDexSearchList from '@src/components/nugg/NuggDex/NuggDexSearchList/NuggDexSearchList';
import ViewingNugg from '@src/components/nugg/ViewingNugg/ViewingNugg';
import useAnimateOverlay from '@src/hooks/useAnimateOverlay';
import AppState from '@src/state/app';

import styles from './SearchOverlay.styles';

type Props = {};

const SearchOverlay: FunctionComponent<Props> = () => {
    const screenType = AppState.select.screenType();
    const view = AppState.select.view();
    const onClick = useCallback(
        () => (view === 'Search' ? AppState.dispatch.changeView('Swap') : undefined),
        [view],
    );
    const style = useAnimateOverlay(view === 'Search', {
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
