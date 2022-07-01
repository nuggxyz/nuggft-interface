import React from 'react';
import { useNavigate, useMatch } from 'react-router-dom';

import lib from '@src/lib';
import useDimensions from '@src/client/hooks/useDimensions';
import useMobileViewingNugg from '@src/client/hooks/useMobileViewingNugg';
import emitter from '@src/emitter';

const PREFIX = lib.constants.VIEWING_PREFIX;

export default () => {
	const navigate = useNavigate();

	const { goto: gotoMobile } = useMobileViewingNugg();

	const [, isPhone] = useDimensions();

	const gotoViewingNugg = React.useCallback(
		(tokenId: TokenId) => {
			if (isPhone) {
				gotoMobile(tokenId);
				emitter.emit(emitter.events.RequestCloseMobileNavbar, {});
			} else navigate(`/view/${PREFIX}/${tokenId}`);
		},
		[navigate, isPhone, gotoMobile],
	);

	const tokenId = useMatch(`/view/id/:yo`);

	const showMobileViewOverlay = React.useMemo(() => {
		return !!tokenId?.params.yo && isPhone;
	}, [tokenId, isPhone]);

	return {
		gotoViewingNugg,
		safeTokenId: tokenId?.params.yo as TokenId | undefined,
		showMobileViewOverlay,
	};
};
