import useMountLogger from '@src/hooks/useMountLogger';

import useRpcUpdater from './update/useRpcUpdater';
import useMediaUpdater from './update/useMediaUpdater';
import useBackgroundUpdater from './update/useBackgroundUpdater';
import useSwapUpdater from './update/useSwapUpdater';
import useLiveGraphHealth from './subscriptions/useLiveGraphHealth';
import useDimensionsUpdater from './update/useDimensionsUpdater';
import { useVisualViewportUpdater, useEmitOnKeyboardClose } from './viewport';
import { useCloseModalOnKeyboardClose } from './modal';
import { useUpdateTransactionOnEmit } from './transactions';
import { useEpochUpdater } from './epoch';
import useOnRouteChange from './hooks/useOnRouteChange';
import { usePollV2 } from './v2';
import { useUserUpdater } from './user';
import { useBlockUpdater } from './block';

export default () => {
    useBlockUpdater();

    useDimensionsUpdater();

    useMediaUpdater();

    useBackgroundUpdater();

    useRpcUpdater();

    useUserUpdater();

    useLiveGraphHealth();

    useSwapUpdater();

    useMountLogger('ClientUpdater');

    useVisualViewportUpdater();

    useEmitOnKeyboardClose();

    useCloseModalOnKeyboardClose();

    useUpdateTransactionOnEmit();

    useEpochUpdater();

    useOnRouteChange();

    usePollV2();

    return null;
};
