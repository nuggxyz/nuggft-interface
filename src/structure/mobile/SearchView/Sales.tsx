import React, { FunctionComponent, SetStateAction, useCallback, useEffect, useState } from 'react';

import NuggList from '@src/components/nugg/NuggDex/NuggDexSearchList/components/NuggList';
import { isUndefinedOrNullOrArrayEmpty } from '@src/lib';
import constants from '@src/lib/constants';
import activeNuggsQuery from '@src/state/nuggdex/queries/activeNuggsQuery';
import ProtocolState from '@src/state/protocol';
import config from '@src/web3/config';

type Props = {};

const Sales: FunctionComponent<Props> = () => {
    const epoch = ProtocolState.select.epoch();
    const [activeNuggs, setActiveNuggs] = useState<NL.GraphQL.Fragments.Nugg.ListItem[]>([]);

    const [loading, setLoading] = useState(false);
    const chainId = config.priority.usePriorityChainId();

    const handleGetActive = useCallback(
        async (
            setResults: any,
            startFrom: number,
            addToResult: boolean = false,
            filters: NL.Redux.NuggDex.Filters,
            setLoading?: React.Dispatch<SetStateAction<boolean>>,
        ) => {
            setLoading && setLoading(true);
            const activeNuggs = await activeNuggsQuery(
                chainId,

                filters ? filters.sort.by : 'id',
                filters && filters.sort.asc ? 'asc' : 'desc',
                filters ? filters.searchValue : '',
                epoch.id,
                constants.NUGGDEX_SEARCH_LIST_CHUNK,
                startFrom,
            );
            if (!isUndefinedOrNullOrArrayEmpty(activeNuggs)) {
                setResults((res) => (addToResult ? [...res, ...activeNuggs] : activeNuggs));
            }
            setLoading && setLoading(false);
        },
        [epoch],
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
            return handleGetActive(
                setActiveNuggs,
                addToList ? activeNuggs.length : 0,
                addToList,
                filters,
            );
        },
        [setActiveNuggs, handleGetActive, activeNuggs],
    );

    useEffect(() => {
        onScrollEnd({ setLoading });
    }, []);

    return (
        <div>
            <NuggList
                values={activeNuggs}
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

export default Sales;
