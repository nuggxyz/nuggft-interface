import React, {
    CSSProperties,
    FunctionComponent,
    useCallback,
    useLayoutEffect,
    useState,
} from 'react';
import { AlertCircle } from 'react-feather';
import { useSpring } from '@react-spring/core';
import { animated } from '@react-spring/web';

import {
    isUndefinedOrNullOrNotNumber,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '@src/lib';
import ProtocolState from '@src/state/protocol';
import AppState from '@src/state/app';
import Button from '@src/components/general/Buttons/Button/Button';
import Layout from '@src/lib/layout';
import TokenViewer from '@src/components/nugg/TokenViewer';
import SwapState from '@src/state/swap';
import config from '@src/state/web32/config';

import styles from './ChainIndicator.styles';

type Props = {
    onClick?: () => void;
    style?: CSSProperties;
    textStyle?: CSSProperties;
};

const ChainIndicator: FunctionComponent<Props> = ({ onClick, style, textStyle }) => {
    const epoch = ProtocolState.select.epoch();
    const view = AppState.select.view();
    const currentBlock = ProtocolState.select.currentBlock();
    const swapId = SwapState.select.id();
    const chainId = config.priority.usePriorityChainId();
    const provider = config.priority.usePriorityProvider();

    const [blocksRemaining, setBlocksRemaining] = useState(0);

    const getBlocksRemaining = useCallback(async () => {
        let remaining = 0;

        if (
            !isUndefinedOrNullOrObjectEmpty(epoch) &&
            !isUndefinedOrNullOrStringEmpty(epoch.endblock) &&
            !isUndefinedOrNullOrNotNumber(currentBlock)
        ) {
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
        display: 'flex',
        alignItems: 'center',
        opacity: epoch && +epoch.id ? 1 : 0,
    });

    const LeftIcon = useCallback(
        () =>
            false ? (
                <AlertCircle size={24} style={{ paddingRight: 0.5 + 'rem' }} />
            ) : (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* <ChainIndicatorPulse /> */}
                    <TokenViewer
                        tokenId={epoch?.id || ''}
                        style={{
                            width: '37px',
                            height: '37px',
                            marginTop: '0.2rem',
                            margin: '0rem .5rem 0rem 0rem',
                        }}
                    />
                </div>
            ),
        [provider, epoch],
    );

    return (
        <animated.div style={springStyle}>
            <Button
                textStyle={{
                    fontFamily: Layout.font.code.regular,
                    ...textStyle,
                }}
                onClick={
                    onClick ||
                    (() =>
                        AppState.onRouteUpdate(
                            chainId,
                            view === 'Search' || (swapId && !swapId.includes(epoch.id))
                                ? '/'
                                : `/nugg/${epoch.id}`,
                        ))
                }
                buttonStyle={{
                    ...styles.button,
                    ...(provider ? styles.warning : styles.normal),
                    ...style,
                }}
                leftIcon={<LeftIcon />}
                label={epoch?.id + ' | ' + blocksRemaining}
            />
        </animated.div>
    );
};

export default React.memo(ChainIndicator);
