import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core';

import './prototypes';
global.Buffer = global.Buffer || require('buffer').Buffer;

import store from './state/store';
import './index.css';
import { NetworkContextName } from './config';
import Web3State from './state/web3';
import Initializer from './state/Initializer';
import Modal from './components/nugg/Modals/Modal/Modal';
import IndexPage from './pages/Index';
import ToastContainer from './components/general/Toast/ToastContainer';

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <Web3ReactProvider getLibrary={Web3State.getLibrary}>
                <Web3ProviderNetwork getLibrary={Web3State.getLibrary}>
                    <Initializer>
                        <ToastContainer />
                        <Modal />
                        <IndexPage />
                    </Initializer>
                </Web3ProviderNetwork>
            </Web3ReactProvider>
        </Provider>
    </React.StrictMode>,
    document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);
