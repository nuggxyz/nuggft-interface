import React from 'react';

import useDimensions from '@src/client/hooks/useDimensions';

import PageWrapper from './PageWrapper';

export default () => {
    const { isPhone } = useDimensions();

    return isPhone ? <PageWrapper /> : null;
};
