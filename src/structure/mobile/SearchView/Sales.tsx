import React, { FunctionComponent } from 'react';

type Props = {};

const Sales: FunctionComponent<Props> = () => {
    // const epoch__id = client.live.epoch__id();
    // const [activeNuggs, setActiveNuggs] = useState<NL.GraphQL.Fragments.Nugg.ListItem[]>([]);

    // const [loading, setLoading] = useState(false);
    // const chainId = web3.hook.usePriorityChainId();

    // const handleGetActive = useCallback(
    //     async (
    //         setResults: any,
    //         startFrom: number,
    //         addToResult: boolean = false,
    //         filters: NL.Redux.NuggDex.Filters,
    //         setLoading?: React.Dispatch<SetStateAction<boolean>>,
    //     ) => {
    //         setLoading && setLoading(true);
    //         const activeNuggs = await activeNuggsQuery(
    //             chainId,

    //             filters ? filters.sort.by : 'id',
    //             filters && filters.sort.asc ? 'asc' : 'desc',
    //             filters ? filters.searchValue : '',
    //             epoch__id?.toString(),
    //             constants.NUGGDEX_SEARCH_LIST_CHUNK,
    //             startFrom,
    //         );
    //         if (!isUndefinedOrNullOrArrayEmpty(activeNuggs)) {
    //             setResults((res) => (addToResult ? [...res, ...activeNuggs] : activeNuggs));
    //         }
    //         setLoading && setLoading(false);
    //     },
    //     [epoch__id],
    // );

    // const onScrollEnd = useCallback(
    //     ({
    //         setLoading,
    //         filters,
    //         addToList,
    //     }: {
    //         setLoading?: React.Dispatch<SetStateAction<boolean>>;
    //         filters?: NL.Redux.NuggDex.Filters;
    //         addToList?: boolean;
    //     }) => {
    //         return handleGetActive(
    //             setActiveNuggs,
    //             addToList ? activeNuggs.length : 0,
    //             addToList,
    //             filters,
    //         );
    //     },
    //     [setActiveNuggs, handleGetActive, activeNuggs],
    // );

    // useEffect(() => {
    //     onScrollEnd({ setLoading });
    // }, []);

    return (
        <div>
            {/* <NuggList
                values={activeNuggs}
                onScrollEnd={onScrollEnd}
                style={{
                    height: '100%',
                    zIndex: 0,
                    width: '100%',
                    position: 'fixed',
                    background: 'transparent',
                }}
            /> */}
        </div>
    );
};

export default Sales;
