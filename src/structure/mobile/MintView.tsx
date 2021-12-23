import React, { FunctionComponent, useMemo } from 'react';

import RingAbout from '../../components/nugg/RingAbout/RingAbout';
import TheRing from '../../components/nugg/TheRing/TheRing';
import AppState from '../../state/app';

import styles from './MintView.styles';

type Props = {};

const MintView: FunctionComponent<Props> = () => {
    const { width, height } = useMemo(() => {
        return { width: window.innerWidth, height: window.innerHeight };
    }, []);
    return (
        <div style={styles.container}>
            <div style={styles.subContainer}>
                <TheRing
                    circleWidth={width * 2.5}
                />
            </div>
            <div style={styles.subContainer}>
                <RingAbout />
            </div>
        </div>
    );
};

export default MintView;
