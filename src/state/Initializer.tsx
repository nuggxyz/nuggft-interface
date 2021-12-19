import React, {
    FunctionComponent,
    ReactChild,
    useEffect,
    useState,
} from 'react';

import Loader from '../components/general/Loader/Loader';

const reducerRegistry = import('./ReducerRegistry');
const AppState = import('./app');
const NuggDexState = import('./nuggdex');
const ProtocolState = import('./protocol');
const SwapState = import('./swap');
const TokenState = import('./token');
const TransactionState = import('./transaction');
const WalletState = import('./wallet');
const Web3State = import('./web3');

type Props = {
    children?: ReactChild | ReactChild[];
};

const Initializer: FunctionComponent<Props> = ({ children }) => {
    const [initialized, setInitialized] = useState(false);
    const [states, setStates] = useState([]);

    useEffect(() => {
        reducerRegistry
            .then(async (reducerRegistry) => {
                const tempStates = [];
                await TransactionState.then((state) => {
                    tempStates.push(state.default);
                    reducerRegistry.default.register(
                        state.default.nombre,
                        state.default.reducer,
                    );
                });
                await WalletState.then((state) => {
                    tempStates.push(state.default);
                    reducerRegistry.default.register(
                        state.default.nombre,
                        state.default.reducer,
                    );
                });
                await TokenState.then((state) => {
                    tempStates.push(state.default);
                    reducerRegistry.default.register(
                        state.default.nombre,
                        state.default.reducer,
                    );
                });
                await SwapState.then((state) => {
                    tempStates.push(state.default);
                    reducerRegistry.default.register(
                        state.default.nombre,
                        state.default.reducer,
                    );
                });
                await ProtocolState.then((state) => {
                    tempStates.push(state.default);
                    reducerRegistry.default.register(
                        state.default.nombre,
                        state.default.reducer,
                    );
                });
                await NuggDexState.then((state) => {
                    tempStates.push(state.default);
                    reducerRegistry.default.register(
                        state.default.nombre,
                        state.default.reducer,
                    );
                });
                await AppState.then((state) => {
                    tempStates.push(state.default);
                    reducerRegistry.default.register(
                        state.default.nombre,
                        state.default.reducer,
                    );
                });
                await Web3State.then((state) => {
                    tempStates.push(state.default);
                    reducerRegistry.default.register(
                        state.default.nombre,
                        state.default.reducer,
                    );
                });
                reducerRegistry.default.setMiddlewares(
                    tempStates.flatMap((state) => state.middlewares),
                );
                setStates(tempStates);
            })
            .then(() => setInitialized(true));
    }, []);
    return initialized ? (
        <>
            {Object.values(states).map((state, index) => (
                <state.updater key={state.nombre} />
            ))}
            {/* <Web3State.updater />
            <ProtocolState.updater />
            <AppState.updater />
            <NuggDexState.updater />
            <SwapState.updater />
            <TokenState.updater />
            <WalletState.updater />
            <TransactionState.updater /> */}
            {children}
        </>
    ) : (
        <div>
            <Loader />
        </div>
    );
};

export default Initializer;
