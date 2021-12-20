import React, {
    FunctionComponent,
    useCallback,
    useLayoutEffect,
    useState,
} from 'react';
import { AlertCircle } from 'react-feather';
import { useSpring } from '@react-spring/core';
import { animated } from '@react-spring/web';

import { isUndefinedOrNullOrObjectEmpty } from '../../../../lib';
import ProtocolState from '../../../../state/protocol';
import AppState from '../../../../state/app';
import Button from '../Button/Button';
import Layout from '../../../../lib/layout';
import Web3Selectors from '../../../../state/web3/selectors';

import styles from './ChainIndicator.styles';
import ChainIndicatorPulse from './ChainIndicatorPulse';

type Props = {};

const ChainIndicator: FunctionComponent<Props> = () => {
    const epoch = ProtocolState.select.epoch();
    const connectionWarning = Web3Selectors.connectivityWarning();
    const currentBlock = ProtocolState.select.currentBlock();

    const [blocksRemaining, setBlocksRemaining] = useState(0);

    const getBlocksRemaining = useCallback(async () => {
        let remaining = 0;

        if (!isUndefinedOrNullOrObjectEmpty(epoch)) {
            remaining = +epoch.endblock - currentBlock;
        }
        if (remaining <= 0) {
            remaining = 0;
        }

        setBlocksRemaining(remaining);
    }, [currentBlock, epoch]);

    useLayoutEffect(() => {
        getBlocksRemaining();
    }, [getBlocksRemaining]);

    const springStyle = useSpring({
        opacity: epoch ? 1 : 0,
    });

    return (
        <animated.div style={springStyle}>
            <Button
                textStyle={{ fontFamily: Layout.font.code.regular }}
                onClick={() => AppState.onRouteUpdate('/')}
                buttonStyle={{
                    ...styles.button,
                    ...(connectionWarning ? styles.warning : styles.normal),
                }}
                leftIcon={
                    connectionWarning ? (
                        <AlertCircle
                            size={24}
                            style={{ paddingRight: 0.5 + 'rem' }}
                        />
                    ) : (
                        <ChainIndicatorPulse />
                    )
                }
                label={epoch?.id + ' | ' + blocksRemaining}
            />
        </animated.div>
    );
};

export default ChainIndicator;
