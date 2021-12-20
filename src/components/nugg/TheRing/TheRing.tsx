import React, { FunctionComponent, useMemo } from 'react';

import { isUndefinedOrNullOrObjectEmpty } from '../../../lib';
import Colors from '../../../lib/colors';
import constants from '../../../lib/constants';
import ProtocolState from '../../../state/protocol';
import SwapState from '../../../state/swap';
import CircleTimer from '../../general/AnimatedTimers/CircleTimer/CircleTimer';
import AnimatedCard from '../../general/Cards/AnimatedCard/AnimatedCard';
import TokenViewer from '../TokenViewer';

import styles from './TheRing.styles';

type Props = {};

const TheRing: FunctionComponent<Props> = () => {
    const lastBlock = ProtocolState.select.currentBlock();
    const epoch = ProtocolState.select.epoch();
    const nugg = SwapState.select.nugg();
    const status = SwapState.select.status();

    const blockDuration = useMemo(() => {
        let remaining = 0;
        if (!isUndefinedOrNullOrObjectEmpty(epoch)) {
            remaining = +epoch.endblock - +epoch.startblock;
        }
        if (remaining <= 0) {
            remaining = 0;
        }
        return remaining;
    }, [epoch]);

    const blocksRemaining = useMemo(() => {
        let remaining = 0;

        if (!isUndefinedOrNullOrObjectEmpty(epoch)) {
            remaining = +epoch.endblock - lastBlock;
        }
        if (remaining <= 0) {
            remaining = 0;
        }

        return remaining;
    }, [lastBlock, epoch]);

    return (
        <CircleTimer
            duration={blockDuration}
            remaining={blocksRemaining}
            blocktime={constants.BLOCKTIME}
            width={1600}
            staticColor={
                status === 'over'
                    ? Colors.purple
                    : status === 'waiting'
                    ? Colors.green
                    : ''
            }
            style={styles.circle}>
            <AnimatedCard>
                <TokenViewer tokenId={(nugg && nugg.id) || ''} showLabel />
            </AnimatedCard>
        </CircleTimer>
    );
};

export default React.memo(TheRing);
