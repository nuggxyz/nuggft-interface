import React, { FunctionComponent } from 'react';

import Text from '@src/components/general/Texts/Text/Text';
import FloorPrice from '@src/components/nugg/FloorPrice';
import RingAbout from '@src/components/nugg/RingAbout/RingAbout';
import TheRing from '@src/components/nugg/TheRing/TheRing';
import AppState from '@src/state/app';
import SwapState from '@src/state/swap';

import styles from './MintView.styles';

type Props = {};

const MintView: FunctionComponent<Props> = () => {
    const { width, height } = AppState.select.dimensions();
    const nugg = SwapState.select.nugg();
    return (
        <div style={styles.container}>
            <FloorPrice style={{ zIndex: 0, marginTop: '.3rem' }} />
            <div style={styles.ring}>
                <TheRing circleWidth={Math.min(width * 2.7, height / 0.6)} />
                {nugg && <Text textStyle={{ marginBottom: '.4rem' }}>Nugg #{nugg.id}</Text>}
            </div>
            <div style={styles.ringAbout}>
                <RingAbout />
            </div>
        </div>
    );
};

export default MintView;
