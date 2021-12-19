import { useEffect } from 'react';

import { gatsbyDOM } from '../../lib';

import AppState from '.';

export default () => {
    const resizer = () => {
        AppState.dispatch.setWindowDimensions({
            height: gatsbyDOM('window') ? window.innerHeight : 0,
            width: gatsbyDOM('window') ? window.innerWidth : 0,
        });
    };

    useEffect(() => {
        resizer();
        if (gatsbyDOM('window')) window.addEventListener('resize', resizer);
        return () => {
            if (gatsbyDOM('window'))
                window.removeEventListener('resize', resizer);
        };
    }, []);

    return null;
};
