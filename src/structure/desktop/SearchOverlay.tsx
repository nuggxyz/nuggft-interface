import { animated } from '@react-spring/web';
import React, { FunctionComponent } from 'react';

import NuggDexSearchList from '../../components/nugg/NuggDex/NuggDexSearchList/NuggDexSearchList';
import ViewingNugg from '../../components/nugg/ViewingNugg/ViewingNugg';
import useAnimateOverlay from '../../hooks/useAnimateOverlay';
import AppSelectors from '../../state/app/selectors';

import styles from './SearchOverlay.styles';

type Props = {};

const SearchOverlay: FunctionComponent<Props> = () => {
    const appView = AppSelectors.view();
    const style = useAnimateOverlay(appView === 'Search', { zIndex: 997 });
    return (
        <animated.div style={{ ...styles.container, ...style }}>
            <div style={styles.nuggDexContainer}>
                <NuggDexSearchList />
            </div>
            <div style={styles.tokenContainer}>
                <ViewingNugg />
            </div>
        </animated.div>
    );
};

export default SearchOverlay;
