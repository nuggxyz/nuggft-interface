import { useLocation } from 'react-router-dom';
import React from 'react';

import usePrevious from '@src/hooks/usePrevious';
import emitter from '@src/emitter';

export default () => {
    const location = useLocation();

    const prevLocation = usePrevious(location);

    React.useEffect(() => {
        console.log({ location: location.pathname, prevLocation: prevLocation?.pathname });
        if (location.pathname !== prevLocation?.pathname) {
            console.log('AYYYEEEEEEEEEEEEEEEEEE');
            emitter.emit({
                type: emitter.events.RouteChange,
                newRoute: location.pathname,
                prevRoute: prevLocation?.pathname ?? null,
            });
        }
    }, [location, prevLocation]);

    return null;
};
