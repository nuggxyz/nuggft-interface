import React, { useCallback, useEffect, useState } from 'react';

import config from './config';

export default () => {
    useEffect(() => {
        void config.connectors.metamask.connector.connectEagerly();
        void config.connectors.walletconnect.connector.connectEagerly();
        void config.connectors.network.connector.activate();
    }, []);

    return null;
};
