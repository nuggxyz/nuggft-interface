import React from 'react';

import { userAgent } from '@src/lib/userAgent';

export default (size: 'small' | 'large') => {
    return React.useMemo(() => {
        let sw = 1;
        if (
            userAgent.browser.name === 'Safari' ||
            userAgent.browser.name === 'Mobile Safari' ||
            userAgent.browser.name === 'Firefox'
        ) {
            sw = size === 'small' ? 1.2 : 1.05;
        }

        return { '--dotnugg-stroke-width': sw };
    }, [size]);
};
