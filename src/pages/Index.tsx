import * as React from 'react';
import { Helmet } from 'react-helmet';

import AppState from '../state/app';
import Desktop from '../structure/desktop';
import Mobile from '../structure/mobile';

const IndexPage = () => {
    return AppState.isMobile ? <Mobile /> : <Desktop />;
};

export default IndexPage;
