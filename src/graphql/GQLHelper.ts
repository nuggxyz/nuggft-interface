import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import web3 from '@src/web3';
import { SupportedChainId } from '../web3/config';

export default class GQLHelper {
    protected static _instance: ApolloClient<NormalizedCacheObject>;

    static instance(chainId: SupportedChainId) {
        // if (isUndefinedOrNullOrObjectEmpty(GQLHelper._instance)) {
        GQLHelper._instance = new ApolloClient({
            link: new HttpLink({
                // uri: Web3Config.GRAPH_ENPOINTS[store.getState().web3.currentChain],
                uri: web3.config.GRAPH_ENPOINTS[chainId],
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
