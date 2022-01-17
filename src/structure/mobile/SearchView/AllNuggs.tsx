import React, {
    FunctionComponent,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from 'react';

import NuggList from '../../../components/nugg/NuggDex/NuggDexSearchList/components/NuggList';
import constants from '../../../lib/constants';
import allNuggsQuery from '../../../state/nuggdex/queries/allNuggsQuery';

type Props = {};

const AllNuggs: FunctionComponent<Props> = () => {
    const [allNuggs, setAllNuggs] = useState<
        NL.GraphQL.Fragments.Nugg.ListItem[]
    >([]);
    const [loading, setLoading] = useState(false);

    const handleGetAll = useCallback(
        async (
            setResults: any,
            startFrom: number,
            addToResult: boolean = false,
            filters: NL.Redux.NuggDex.Filters,
            setLoading?: React.Dispatch<SetStateAction<boolean>>,
        ) => {
            setLoading && setLoading(true);
            const allNuggs = await allNuggsQuery(
                filters ? filters.sort.by : 'id',
                filters && filters.sort.asc ? 'asc' : 'desc',
                filters ? filters.searchValue : '',
                constants.NUGGDEX_SEARCH_LIST_CHUNK,
                startFrom,
            );
            setResults((res) =>
                addToResult ? [...res, ...allNuggs] : allNuggs,
            );
            setLoading && setLoading(false);
        },
        [],
    );

    const onScrollEnd = useCallback(
        ({
            setLoading,
            filters,
            addToList,
        }: {
            setLoading?: React.Dispatch<SetStateAction<boolean>>;
            filters?: NL.Redux.NuggDex.Filters;
            addToList?: boolean;
        }) => {
            return handleGetAll(
                setAllNuggs,
                addToList ? allNuggs.length : 0,
                addToList,
                filters,
                setLoading,
            );
        },

        [allNuggs, handleGetAll],
    );

    useEffect(() => {
        onScrollEnd({ setLoading });
    }, []);

    return (
        <div>
            <NuggList
                values={allNuggs}
                onScrollEnd={onScrollEnd}
                style={{
                    height: '100%',
                    zIndex: 0,
                    width: '100%',
                    position: 'fixed',
                    background: 'transparent',
                }}
            />
        </div>
    );
};

export default AllNuggs;