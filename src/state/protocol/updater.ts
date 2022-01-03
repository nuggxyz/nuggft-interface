import { useCallback, useEffect } from 'react';
import { gql, useSubscription } from '@apollo/client';

import useRecursiveTimeout from '../../hooks/useRecursiveTimeout';
import {
    isUndefinedOrNullOrNumberZero,
    isUndefinedOrNullOrObjectEmpty,
} from '../../lib';
import constants from '../../lib/constants';
import { _metaBare } from '../../graphql/fragments/_meta';
import { client } from '../../graphql/client';

import ProtocolState from '.';

export default () => {
    const block = ProtocolState.select.currentBlock();
    const epoch = ProtocolState.select.epoch();

    const checkEpoch = useCallback(() => {
        if (
            isUndefinedOrNullOrObjectEmpty(epoch) ||
            (!isUndefinedOrNullOrNumberZero(block) && block >= +epoch.endblock)
        ) {
            ProtocolState.dispatch.updateEpoch();
            // ProtocolState.dispatch.updateStaked();
        }
    }, [epoch, block]);

    // const { data } = useSubscription(
    //     gql`
    //         subscription Cool {
    //             _meta {
    //                 block {
    //                     number
    //                 }
    //             }
    //         }
    //     `,
    //     { client },
    // );

    // useEffect(() => {
    //     if (data && data._meta && data._meta.block && data._meta.block.number) {
    //         ProtocolState.dispatch.setCurrentBlock(data._meta.block.number);
    //         console.log('blocknum');
    //         checkEpoch();
    //     }
    // }, [data]);

    useRecursiveTimeout(() => {
        checkEpoch();
        ProtocolState.dispatch.updateBlock();
    }, constants.QUERYTIME);
    return null;
};
