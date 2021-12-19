import * as React from 'react';
import loadable from '@loadable/component';

const Structure = loadable(() => import('../structure'));

const IndexPage = ({ location }) => {
    return (
        <div>
            <Structure />
        </div>
    );
    // const isMobile = AppState.select.isSmallDevice();

    // return isMobile ? (
    //     <></>
    // ) : (
    //     <PageContainer>
    //         <Helmet></Helmet>
    //         <SearchOverlay />
    //         <SwapPage />
    //     </PageContainer>
    // );
};

export default IndexPage;
//
