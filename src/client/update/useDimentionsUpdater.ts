import React, { useEffect } from 'react';

import client from '@src/client';

export default () => {
    const updateDimentions = client.mutate.updateDimentions();

    const resizer = React.useCallback(() => {
        console.log('hellooo');
        updateDimentions({
            height: window.innerHeight,
            width: window.innerWidth,
        });
    }, [updateDimentions]);

    useEffect(() => {
        resizer();
        window.addEventListener('resize', resizer);
        return () => {
            window.removeEventListener('resize', resizer);
        };
    }, []);

    return null;
};
