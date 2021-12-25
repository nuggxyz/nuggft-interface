import { animated } from '@react-spring/web';
import React, { FunctionComponent, useCallback } from 'react';

import NuggDexSearchList from '../../components/nugg/NuggDex/NuggDexSearchList/NuggDexSearchList';
import ViewingNugg from '../../components/nugg/ViewingNugg/ViewingNugg';
import useAnimateOverlay from '../../hooks/useAnimateOverlay';
import AppState from '../../state/app';

import styles from './SearchOverlay.styles';

type Props = {};

const SearchOverlay: FunctionComponent<Props> = () => {
    const view = AppState.select.view();
    const onClick = useCallback(
        () =>
            view === 'Search'
                ? AppState.dispatch.changeView('Swap')
                : undefined,
        [view],
    );
    const style = useAnimateOverlay(view === 'Search', {
        zIndex: 997,
        ...styles.container,
    });
    return (
        <animated.div
            style={{ ...styles.container, ...style }}
            onClick={onClick}>
            <div
                style={styles.nuggDexContainer}
                onClick={(e) => e.stopPropagation()}>
                <NuggDexSearchList />
            </div>
            <div
                style={styles.tokenContainer}
                onClick={(e) => e.stopPropagation()}>
                <ViewingNugg />
            </div>
        </animated.div>
    );
};

export default SearchOverlay;
