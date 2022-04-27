import useMountLogger from '@src/hooks/useMountLogger';

import useRpcUpdater from './update/useRpcUpdater';
import useMediaUpdater from './update/useMediaUpdater';
import useBackgroundUpdater from './update/useBackgroundUpdater';
import useLiveProtocol from './subscriptions/useLiveProtocol';
import useLiveUser from './subscriptions/useLiveUser';
import useSwapUpdater from './update/useSwapUpdater';
import useLiveGraphHealth from './subscriptions/useLiveGraphHealth';
import useDimentionsUpdater from './update/useDimentionsUpdater';
import useLiveStakeBackup from './backups/useLiveStakeBackup';
// import useGraphUpdater from './update/useGraphUpdater';

export default () => {
    useDimentionsUpdater();

    useMediaUpdater();

    useBackgroundUpdater();

    useRpcUpdater();

    useLiveProtocol();

    useLiveUser();

    useLiveGraphHealth();

    useSwapUpdater();

    useMountLogger('ClientUpdater');

    useLiveStakeBackup();

    // useGraphUpdater();

    return null;
};
