import React, { FunctionComponent } from 'react';

import Text from '@src/components/general/Texts/Text/Text';
import FloorPrice from '@src/components/nugg/FloorPrice';
import RingAbout from '@src/components/nugg/RingAbout/RingAbout';
import TheRing from '@src/components/nugg/TheRing/TheRing';
import AppState from '@src/state/app';
import client from '@src/client';
import { parseTokenIdSmart } from '@src/lib';

import styles from './MintView.styles';

type Props = Record<string, never>;

const MintView: FunctionComponent<Props> = () => {
    const { width, height } = AppState.select.dimensions();
    const lastSwap__tokenId = client.live.lastSwap.tokenId();
    return (
        <div style={styles.container}>
            <FloorPrice style={{ zIndex: 0, marginTop: '.3rem' }} />
            <div style={styles.ring}>
                <TheRing circleWidth={Math.min(width * 2.7, height / 0.6)} />
                {lastSwap__tokenId && (
                    <Text textStyle={{ marginBottom: '.4rem' }}>
                        {parseTokenIdSmart(lastSwap__tokenId)}
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
