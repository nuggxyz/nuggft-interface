import React from 'react';
import { Provider } from 'react-redux';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';
import './prototypes';

// import Initializer from './state/Initializer';
import store from './state/store';
import './index.css';
import { NetworkContextName } from './config';
// import Modal from './components/nugg/Modals/Modal/Modal';
// import ToastContainer from './components/general/Toast/ToastContainer';
import Web3State from './state/web3';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

export default ({ element }) => {
    return (
        <Provider store={store}>
            <Web3ReactProvider getLibrary={Web3State.getLibrary}>
                <Web3ProviderNetwork getLibrary={Web3State.getLibrary}>
                    {/* <Initializer> */}
                    {/* <ToastContainer />
                        <Modal /> */}
                    {element}
                    {/* </Initializer> */}
                </Web3ProviderNetwork>
            </Web3ReactProvider>
        </Provider>
    );
};

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
