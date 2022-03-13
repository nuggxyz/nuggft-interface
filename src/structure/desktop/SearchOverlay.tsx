import { animated } from '@react-spring/web';
import React, { FunctionComponent, useCallback } from 'react';

import NuggDexSearchList from '@src/components/nugg/NuggDex/NuggDexSearchList/NuggDexSearchList';
import ViewingNugg from '@src/components/nugg/ViewingNugg/ViewingNugg';
import useAnimateOverlay from '@src/hooks/useAnimateOverlay';
import AppState from '@src/state/app';
import client from '@src/client';
import useFirefoxBlur from '@src/hooks/useFirefoxBlur';

import styles from './SearchOverlay.styles';

type Props = Record<string, never>;

const SearchOverlay: FunctionComponent<Props> = () => {
    const screenType = AppState.select.screenType();

    const isViewOpen = client.live.isViewOpen();

    const onClick = useCallback(
        () => (isViewOpen ? client.actions.toggleView() : undefined),
        [isViewOpen],
    );
    const style = useAnimateOverlay(isViewOpen, {
        zIndex: 997,
        ...styles.container,
    });

    const modalStyle = useFirefoxBlur(['modal']);

    return (
        <animated.div style={{ ...styles.container, ...style, ...modalStyle }} onClick={onClick}>
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
