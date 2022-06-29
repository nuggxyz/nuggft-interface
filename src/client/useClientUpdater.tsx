import useMountLogger from '@src/hooks/useMountLogger';
import { useDevLogger } from '@src/emitter/core';

import useRpcUpdater from './update/useRpcUpdater';
import useMediaUpdater from './update/useMediaUpdater';
import useBackgroundUpdater from './update/useBackgroundUpdater';
import useSwapUpdater from './update/useSwapUpdater';
import useDimensionsUpdater from './update/useDimensionsUpdater';
import { useVisualViewportUpdater, useEmitOnKeyboardClose } from './viewport';
import { useCloseModalOnKeyboardClose } from './modal';
import { useUpdateTransactionOnEmit } from './transactions';
import { useEpochUpdater } from './epoch';
import useOnRouteChange from './hooks/useOnRouteChange';
import { usePollV2 } from './v2';
import { useUserUpdater } from './user';
import { useBlockUpdater } from './block';
import { useHealthUpdater } from './health';
import { useUsdUpdater } from './usd';
import { useEnsUpdater } from './ens';

export default () => {
	useBlockUpdater();

	useHealthUpdater();

	useDimensionsUpdater();

	useMediaUpdater();

	useBackgroundUpdater();

	useRpcUpdater();

	useUserUpdater();

	useSwapUpdater();

	useMountLogger('ClientUpdater');

	useVisualViewportUpdater();

	useEmitOnKeyboardClose();

	useCloseModalOnKeyboardClose();

	useUpdateTransactionOnEmit();

	useEpochUpdater();

	useOnRouteChange();

	usePollV2();

	useUsdUpdater();

	useDevLogger();

	useEnsUpdater();

	return null;
};
