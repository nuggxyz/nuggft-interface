import {
    ApolloClient,
    HttpLink,
    InMemoryCache,
    NormalizedCacheObject,
} from '@apollo/client';
import { isUndefinedOrNullOrObjectEmpty } from '../lib';
import Web3Config from '../state/web3/Web3Config';

export default class GQLHelper {
    protected static _instance: ApolloClient<NormalizedCacheObject>;

    static get instance() {
        if (isUndefinedOrNullOrObjectEmpty(GQLHelper._instance)) {
            GQLHelper._instance = new ApolloClient({
                link: new HttpLink({
                    // uri: Web3Config.GRAPH_ENPOINTS[store.getState().web3.currentChain],
                    uri: Web3Config.activeChain__GraphEndpoint,
                    fetch: fetch as any,
                }),
                cache: new InMemoryCache(),
            });
        }
        return GQLHelper._instance;
    }

    static reset() {
        GQLHelper._instance = undefined;
    }
    static set instance(_) {
        return;
    }
}
