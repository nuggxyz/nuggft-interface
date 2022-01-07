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
    const { width } = AppState.select.dimensions();
    const nugg = SwapState.select.nugg();
    return (
        <div style={styles.container}>
            <div style={styles.ring}>
                <TheRing circleWidth={width * 2.8} />
                {nugg && (
                    <Text textStyle={{ marginBottom: '.4rem' }}>
                        Nugg #{nugg.id}
                    </Text>
                )}
            </div>
            <div style={styles.ringAbout}>
                <FloorPrice style={{ zIndex: 0 }} />
                <RingAbout />
            </div>
        </div>
    );
};

export default MintView;
