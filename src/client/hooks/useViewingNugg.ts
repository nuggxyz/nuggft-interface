import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { TokenId } from '@src/client/router';
import lib from '@src/lib';

const PREFIX = lib.constants.VIEWING_PREFIX;

export default () => {
    const navigate = useNavigate();

    const gotoViewingNugg = React.useCallback(
        (tokenId: TokenId) => {
            navigate(`/view/${PREFIX}/${tokenId}`);
        },
        [navigate],
    );

    const path = useParams() as unknown as { '*': `${typeof PREFIX}/${string}` };

    const safeTokenId = React.useMemo(() => {
        if (path['*']?.startsWith(`${PREFIX}/`)) {
            return path['*'].replace(`${PREFIX}/`, '');
        }

        // navigate('/');
        return undefined;
    }, [path]);

    return { gotoViewingNugg, safeTokenId };
};
