export const useTriggerGraphRefresh = () => {
    // const updateClients = client.mutate.updateClients();
    // const graphClient = client.live.graph();
    // const triggerGraphRefresh = useCallback(() => {
    //     // if (chainId && web3.config.isValidChainId(chainId)) {
    //     //     if (graphClient) {
    //     //         void graphClient.clearStore();
    //     //         graphClient.stop();
    //     //     }
    //     //     const gclient = web3.config.createApolloClient(chainId);
    //     //     updateClients(gclient);
    //     // }
    // }, [updateClients, graphClient]);
    // return { triggerGraphRefresh };
};

export default () => {
    // const chainId = web3.hook.usePriorityChainId();

    // const { triggerGraphRefresh } = useTriggerGraphRefresh();

    // const lastGraphRefresh = client.live.lastGraphRefresh();

    // const { graphProblem } = useHealth();

    // useEffect(() => {
    //     // if (chainId) triggerGraphRefresh(chainId);
    // }, [chainId]);

    // useRecursiveTimeout(
    //     React.useCallback(() => {
    //         // if (
    //         //     chainId &&
    //         //     graphProblem &&
    //         //     lastGraphRefresh &&
    //         //     new Date().getTime() - lastGraphRefresh.getTime() > 20000
    //         // ) {
    //         //     triggerGraphRefresh(chainId);
    //         // }
    //     }, [graphProblem, lastGraphRefresh, triggerGraphRefresh, chainId]),
    //     5000,
    // );

    return null;
};
