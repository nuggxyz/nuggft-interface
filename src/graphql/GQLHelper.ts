import { ApolloClient, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
import web3 from '@src/web3';
import { Chain } from '@src/web3/core/interfaces';

export default class GQLHelper {
    protected static _instance: ApolloClient<NormalizedCacheObject> | undefined;

    static instance(chainId: Chain) {
        // if (isUndefinedOrNullOrObjectEmpty(GQLHelper._instance)) {
        GQLHelper._instance = new ApolloClient({
            link: new HttpLink({
                // uri: Web3Config.GRAPH_ENPOINTS[store.getState().web3.currentChain],
                uri: web3.config.GRAPH_ENPOINTS[chainId],
                fetch: fetch as any,
            }),
            cache: new InMemoryCache(),
            // connectToDevTools: true,
        });
        // }
        return GQLHelper._instance;
    }

    static reset() {
        GQLHelper._instance = undefined;
    }
}
