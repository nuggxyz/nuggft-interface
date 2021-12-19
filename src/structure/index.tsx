import React, { FunctionComponent } from 'react';
import { Helmet } from 'react-helmet';
import ToastContainer from '../components/general/Toast/ToastContainer';
import Modal from '../components/nugg/Modals/Modal/Modal';
import PageContainer from '../components/nugg/PageLayout/PageContainer/PageContainer';

// import Loader from '../components/general/Loader/Loader';
import Initializer from '../state/Initializer';
import SearchOverlay from './desktop/SearchOverlay';
import SwapPage from './desktop/SwapPage';

// const ToastContainer = React.lazy(
//     () => import('../components/general/Toast/ToastContainer'),
// );
// const Modal = React.lazy(() => import('../components/nugg/Modals/Modal/Modal'));
// const PageContainer = React.lazy(
//     () => import('../components/nugg/PageLayout/PageContainer/PageContainer'),
// );
// const SearchOverlay = React.lazy(() => import('./desktop/SearchOverlay'));
// const SwapPage = React.lazy(() => import('./desktop/SwapPage'));

type Props = { path?: string };

const index: FunctionComponent<Props> = () => {
    return (
        <Initializer>
            {/* <Suspense fallback={<Loader />}> */}
            <Modal />
            <ToastContainer />
            <PageContainer>
                <Helmet></Helmet>
                <SearchOverlay />
                <SwapPage />
            </PageContainer>
            {/* </Suspense> */}
        </Initializer>
    );
};

export default index;
