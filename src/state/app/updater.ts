import { useEffect } from 'react';

import AppHelpers from './helpers';

const AppUpdater = () => {
    useEffect(() => {
        AppHelpers.onRouteUpdate(window.location.hash);
    }, []);
    return null;
};

export default AppUpdater;
