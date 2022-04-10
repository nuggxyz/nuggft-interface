import React, { FC, PropsWithChildren } from 'react';
import { ApolloProvider } from '@apollo/client/react/context/ApolloProvider';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import './prototypes';
import './lib/analytics';
import './index.css';
import web3 from './web3';
import I18N from './i18n';
import App from './pages/App';
import ErrorBoundary from './components/general/ErrorBoundry';
import useMountLogger from './hooks/useMountLogger';
import useClientUpdater, { useDelayedClientUpdater } from './client/useClientUpdater';
import useAnalyticsReporter from './lib/analytics/useAnalyticsReporter';

global.Buffer = global.Buffer || (await import('buffer')).Buffer;

const GlobalHooks = () => {
    useMountLogger('GlobalHooks');

    web3.config.useActivate();

    useClientUpdater();

    useDelayedClientUpdater();
    useAnalyticsReporter();

    return null;
};

const ContentBlock: FC<PropsWithChildren<unknown>> = ({ children }) => {
    const active = web3.hook.usePriorityIsActive();

    return active ? <>{children}</> : null;
};

const container = document.getElementById('root') as HTMLElement;

const root = createRoot(container);

root.render(
    <HashRouter>
        <ApolloProvider client={web3.config.apolloClient}>
            <GlobalHooks />

            <React.StrictMode>
                <div style={{ width: '100%', height: '100%' }}>
                    <ErrorBoundary>
                        <I18N>
                            <ContentBlock>
                                <App />
                            </ContentBlock>
                        </I18N>
                    </ErrorBoundary>
                </div>
            </React.StrictMode>
        </ApolloProvider>
    </HashRouter>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals(console.log);

// events: {
//     "Approval(address,address,uint256)": EventFragment;
//     "ApprovalForAll(address,address,bool)": EventFragment;
//     "Burn(uint160,address,uint96)": EventFragment;
//     "Claim(uint160,address)": EventFragment;
//     "ClaimItem(uint176,uint160)": EventFragment;
//     "Offer(uint160,address,uint96)": EventFragment; // tokenid, user, new current value
//     "OfferItem(uint176,uint160,uint96)": EventFragment; // tokenId + itemId, 'user',
//     "DotnuggV1ConfigUpdated(uint256)": EventFragment;
//     "Genesis(uint256,uint32,uint24)": EventFragment;
//     "Liquidate(uint160,uint96,address)": EventFragment;
//     "Loan(uint160,uint96)": EventFragment;
//     "MigrateV1Sent(address,uint160,uint256,address,uint96)": EventFragment;
//     "MigratorV1Updated(address)": EventFragment;
//     "Mint(uint160,uint96)": EventFragment;
//     "ProtocolEthExtracted(uint96)": EventFragment;
//     "Rebalance(uint160,uint96)": EventFragment;
//     "Stake(uint256)": EventFragment; // 96 protocol 96 stakedEth 64 (rest) stakedShares
//     "Swap(uint160,uint96)": EventFragment;
//     "SwapItem(uint176,uint96)": EventFragment;
//     "Transfer(address,address,uint256)": EventFragment;
//     "TrustUpdated(address,bool)": EventFragment;
//     "UserTrustUpdated(address,bool)": EventFragment;
//   };
