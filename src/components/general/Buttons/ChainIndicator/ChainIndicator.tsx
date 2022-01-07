import React, {
    CSSProperties,
    FunctionComponent,
    useCallback,
    useLayoutEffect,
    useMemo,
    useState,
} from 'react';
import { AlertCircle } from 'react-feather';
import { useSpring } from '@react-spring/core';
import { animated } from '@react-spring/web';

import {
    isUndefinedOrNullOrNotNumber,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../../../lib';
import ProtocolState from '../../../../state/protocol';
import Web3State from '../../../../state/web3';
import AppState from '../../../../state/app';
import Button from '../Button/Button';
import Text from '../../Texts/Text/Text';
import Layout from '../../../../lib/layout';
import TokenViewer from '../../../nugg/TokenViewer';
import CurrencyText from '../../Texts/CurrencyText/CurrencyText';
import { EthInt } from '../../../../classes/Fraction';
import Colors from '../../../../lib/colors';
import SwapState from '../../../../state/swap';

import styles from './ChainIndicator.styles';
import ChainIndicatorPulse from './ChainIndicatorPulse';

type Props = {
    onClick?: () => void;
    style?: CSSProperties;
    textStyle?: CSSProperties;
};

const ChainIndicator: FunctionComponent<Props> = ({
    onClick,
    style,
    textStyle,
}) => {
    const epoch = ProtocolState.select.epoch();
    const connectionWarning = Web3State.select.connectivityWarning();
    const view = AppState.select.view();
    const currentBlock = ProtocolState.select.currentBlock();
    const swapId = SwapState.select.id();

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
            connectionWarning ? (
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
        [connectionWarning, epoch],
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
                            view === 'Search' || !swapId.includes(epoch.id)
                                ? '/'
                                : `/nugg/${epoch.id}`,
                        ))
                }
                buttonStyle={{
                    ...styles.button,
                    ...(connectionWarning ? styles.warning : styles.normal),
                    ...style,
                }}
                leftIcon={<LeftIcon />}
                label={epoch?.id + ' | ' + blocksRemaining}
            />
        </animated.div>
    );
};

export default React.memo(ChainIndicator);
