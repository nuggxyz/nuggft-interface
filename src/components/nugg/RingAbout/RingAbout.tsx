import React, { FunctionComponent } from 'react';
import { animated } from '@react-spring/web';

import AppState from '@src/state/app';
import { useDarkMode } from '@src/client/hooks/useDarkMode';

import styles from './RingAbout.styles';
import HighestOffer from './HighestOffer';
import OffersList from './OffersList';
import OwnerBlock from './OwnerBlock';
import OfferButton from './OfferButton';
import OfferText from './OfferText';

type Props = Record<string, never>;

const RingAbout: FunctionComponent<Props> = () => {
    const screenType = AppState.select.screenType();
    const darkmode = useDarkMode();
    return (
        <animated.div
            style={{
                ...(screenType === 'tablet'
                    ? styles.containerTablet
                    : darkmode
                    ? styles.containerDark
                    : styles.container),
                ...(screenType === 'phone' && {
                    ...styles.mobile,
                }),
            }}
        >
            <div style={styles.bodyContainer}>
                <OwnerBlock />
                <OfferText />
                <HighestOffer />
            </div>
            <OffersList />
            <OfferButton />
        </animated.div>
    );
};

export default React.memo(RingAbout);
