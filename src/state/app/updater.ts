import { useEffect } from 'react';

import { gatsbyDOM } from '../../lib';

import AppState from '.';

export default () => {
    useEffect(() => {
        AppState.onRouteUpdate(window.location.hash);
    }, []);
    return null;
};
