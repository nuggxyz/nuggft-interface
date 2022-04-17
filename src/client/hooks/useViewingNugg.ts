import React from 'react';
import { useNavigate, useMatch } from 'react-router-dom';

import { TokenId } from '@src/client/router';
import lib from '@src/lib';
import useDimentions from '@src/client/hooks/useDimentions';

const PREFIX = lib.constants.VIEWING_PREFIX;

export default () => {
    const navigate = useNavigate();

    const gotoViewingNugg = React.useCallback(
        (tokenId: TokenId) => {
            navigate(`/view/${PREFIX}/${tokenId}`);
        },
        [navigate],
    );

    const tokenId = useMatch(`/view/id/:yo`);

    const { isPhone } = useDimentions();

    const showMobileViewOverlay = React.useMemo(() => {
        return !!tokenId?.params.yo && isPhone;
    }, [tokenId, isPhone]);

    return { gotoViewingNugg, safeTokenId: tokenId?.params.yo, showMobileViewOverlay };
};
