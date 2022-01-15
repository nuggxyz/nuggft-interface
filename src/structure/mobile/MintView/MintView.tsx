import React, { FunctionComponent, useMemo } from 'react';

import Text from '../../../components/general/Texts/Text/Text';
import FloorPrice from '../../../components/nugg/FloorPrice';
import RingAbout from '../../../components/nugg/RingAbout/RingAbout';
import TheRing from '../../../components/nugg/TheRing/TheRing';
import AppState from '../../../state/app';
import SwapState from '../../../state/swap';

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
                {nugg && (
                    <Text textStyle={{ marginBottom: '.4rem' }}>
                        Nugg #{nugg.id}
                    </Text>
                )}
            </div>
            <div style={styles.ringAbout}>
                <RingAbout />
            </div>
        </div>
    );
};

export default MintView;
