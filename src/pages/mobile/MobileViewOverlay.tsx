import React from 'react';

import client from '@src/client';
import useViewingNugg from '@src/client/hooks/useViewingNugg';

export default () => {
    const openViewScreen = client.viewscreen.useOpenViewScreen();
    const closeViewScreen = client.viewscreen.useCloseViewScreen();

    const { safeTokenId: tokenid } = useViewingNugg();

    React.useEffect(() => {
        if (tokenid) openViewScreen(tokenid);
        return () => {
            closeViewScreen();
        };
    }, [tokenid, openViewScreen, closeViewScreen]);
    return <></>;
};
