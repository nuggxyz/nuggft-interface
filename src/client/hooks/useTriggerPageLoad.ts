import React from 'react';

import client from '..';

export default (abc: unknown, delay: number) => {
    const setPageIsLoaded = client.mutate.setPageIsLoaded();
    const isPageLoaded = client.live.pageIsLoaded();
    React.useEffect(() => {
        if (abc && !isPageLoaded) setTimeout(() => setPageIsLoaded(), delay);
    }, [abc, setPageIsLoaded, isPageLoaded, delay]);
    return null;
};
