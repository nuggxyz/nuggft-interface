import useMountLogger from '@src/hooks/useMountLogger';

import useRpcUpdater from './update/useRpcUpdater';
import useMediaUpdater from './update/useMediaUpdater';
import useBackgroundUpdater from './update/useBackgroundUpdater';
import useLiveProtocol from './subscriptions/useLiveProtocol';
import useLiveUser from './subscriptions/useLiveUser';
import useSwapUpdater from './update/useSwapUpdater';
import useLiveGraphHealth from './subscriptions/useLiveGraphHealth';
import useDimensionsUpdater from './update/useDimensionsUpdater';
import { useVisualViewportUpdater, useEmitOnKeyboardClose } from './viewport';
import { useCloseModalOnKeyboardClose } from './modal';
import { useUpdateTransactionOnEmit } from './transactions';
import { useEpochUpdater } from './epoch';

// import useGraphUpdater from './update/useGraphUpdater';

export default () => {
    useDimensionsUpdater();

    useMediaUpdater();

    useBackgroundUpdater();

    useRpcUpdater();

    useLiveProtocol();

    useLiveUser();

    useLiveGraphHealth();

    useSwapUpdater();

    useMountLogger('ClientUpdater');

    // useLiveStakeBackup();

    useVisualViewportUpdater();

    useEmitOnKeyboardClose();

    useCloseModalOnKeyboardClose();

    useUpdateTransactionOnEmit();

    useEpochUpdater();

    // useGraphUpdater();

    return null;
};
