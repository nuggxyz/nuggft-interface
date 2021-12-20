import React, { FunctionComponent, useMemo } from 'react';

import { isUndefinedOrNullOrObjectEmpty } from '../../../lib';
import Colors from '../../../lib/colors';
import constants from '../../../lib/constants';
import ProtocolSelectors from '../../../state/protocol/selectors';
import SwapSelectors from '../../../state/swap/selectors';
import CircleTimer from '../../general/AnimatedTimers/CircleTimer/CircleTimer';
import AnimatedCard from '../../general/Cards/AnimatedCard/AnimatedCard';
import TokenViewer from '../TokenViewer';

import styles from './TheRing.styles';

type Props = {};

const TheRing: FunctionComponent<Props> = () => {
    const lastBlock = ProtocolSelectors.currentBlock();
    const epoch = ProtocolSelectors.epoch();
    const nugg = SwapSelectors.nugg();
    const status = SwapSelectors.status();

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
