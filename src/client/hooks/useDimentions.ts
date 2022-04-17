import { useMemo } from 'react';

import client from '@src/client';

export default () => {
    const dim = client.live.dimentions();

    const screen = useMemo(() => {
        return dim.width > 1300
            ? ('desktop' as const)
            : dim.width > 750
            ? ('tablet' as const)
            : ('phone' as const);
    }, [dim]);

    return { screen, isPhone: screen === 'phone', ...dim };
};
