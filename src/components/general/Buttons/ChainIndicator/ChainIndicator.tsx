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
import Web3State from '../../../../state/web3';
import AppState from '../../../../state/app';
import Button from '../Button/Button';
import Layout from '../../../../lib/layout';
import TokenViewer from '../../../nugg/TokenViewer';

import styles from './ChainIndicator.styles';
import ChainIndicatorPulse from './ChainIndicatorPulse';

type Props = { onClick?: () => void };

const ChainIndicator: FunctionComponent<Props> = ({ onClick }) => {
    const epoch = ProtocolState.select.epoch();
    const connectionWarning = Web3State.select.connectivityWarning();
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
                onClick={onClick || (() => AppState.onRouteUpdate('/'))}
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
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {/* <ChainIndicatorPulse /> */}
                            <TokenViewer
                                tokenId={epoch?.id || ''}
                                style={{
                                    width: '35px',
                                    height: '35px',
                                    marginTop: '0.2rem',
                                    margin: '0rem .5rem',
                                }}
                            />
                        </div>
                    )
                }
                label={epoch?.id + ' | ' + blocksRemaining}
            />
        </animated.div>
    );
};

export default React.memo(ChainIndicator);
