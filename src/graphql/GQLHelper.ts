import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import config from '../state/web32/config';
import { isUndefinedOrNullOrObjectEmpty } from '../lib';
import Web3Config from '../state/web3/Web3Config';
import { SupportedChainId } from '../state/web32/config';

export default class GQLHelper {
    protected static _instance: ApolloClient<NormalizedCacheObject>;

    static instance(chainId: SupportedChainId) {
        // if (isUndefinedOrNullOrObjectEmpty(GQLHelper._instance)) {
        GQLHelper._instance = new ApolloClient({
            link: new HttpLink({
                // uri: Web3Config.GRAPH_ENPOINTS[store.getState().web3.currentChain],
                uri: config.GRAPH_ENPOINTS[chainId],
                fetch: fetch as any,
            }),
            cache: new InMemoryCache(),
        });
        // }
        return GQLHelper._instance;
    }

    static reset() {
        GQLHelper._instance = undefined;
    }
}
