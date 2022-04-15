import React from 'react';

import useDimentions from '@src/client/hooks/useDimentions';

import PageWrapper from './PageWrapper';

export default () => {
    const { isPhone } = useDimentions();

    return isPhone ? <PageWrapper /> : null;
};
