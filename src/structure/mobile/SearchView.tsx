import React, {
    FunctionComponent,
    SetStateAction,
    useCallback,
    useState,
} from 'react';
import { ChevronLeft } from 'react-feather';

import Button from '../../components/general/Buttons/Button/Button';
import TransitionText from '../../components/general/Texts/TransitionText/TransitionText';
import NuggList from '../../components/nugg/NuggDex/NuggDexSearchList/components/NuggList';
import ViewingNugg from '../../components/nugg/ViewingNugg/ViewingNugg';
import { isUndefinedOrNullOrArrayEmpty, ucFirst } from '../../lib';
import constants from '../../lib/constants';
import activeNuggsQuery from '../../state/nuggdex/queries/activeNuggsQuery';
import allNuggsQuery from '../../state/nuggdex/queries/allNuggsQuery';
import ProtocolState from '../../state/protocol';
import TokenState from '../../state/token';

type Props = {};

const SearchView: FunctionComponent<Props> = () => {
    const [localViewing, setLocalViewing] =
        useState<NL.Redux.NuggDex.SearchViews>('all nuggs');
    const selected = TokenState.select.tokenId();
    const epoch = ProtocolState.select.epoch();

    const [allNuggs, setAllNuggs] = useState<string[]>([]);
    const [activeNuggs, setActiveNuggs] = useState<string[]>([]);

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
                filters.sort.by,
                filters.sort.asc ? 'asc' : 'desc',
                filters.searchValue,
                epoch.id,
                constants.NUGGDEX_SEARCH_LIST_CHUNK,
                startFrom,
            );
            if (!isUndefinedOrNullOrArrayEmpty(activeNuggs)) {
                const ids = activeNuggs.map((active) => active.id);
                setResults((res) => (addToResult ? [...res, ...ids] : ids));
            }
            setLoading && setLoading(false);
        },
        [epoch],
    );

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
                filters.sort.by,
                filters.sort.asc ? 'asc' : 'desc',
                filters.searchValue,
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
            filters: NL.Redux.NuggDex.Filters;
            addToList?: boolean;
        }) => {
            switch (localViewing) {
                case 'all nuggs':
                    return handleGetAll(
                        setAllNuggs,
                        addToList ? allNuggs.length : 0,
                        addToList,
                        filters,
                        setLoading,
                    );
                case 'on sale':
                    return handleGetActive(
                        setActiveNuggs,
                        addToList ? activeNuggs.length : 0,
                        addToList,
                        filters,
                    );
                case 'recently viewed':
                    return () => {};
            }
        },
        [
            allNuggs,
            activeNuggs,
            localViewing,
            setAllNuggs,
            setActiveNuggs,
            handleGetActive,
            handleGetAll,
        ],
    );

    return (
        <div style={{ height: '100%', width: '100%' }}>
            {!selected ? (
                <>
                    <div
                        style={{
                            display: 'flex',
                            width: '100%',
                            justifyContent: 'space-around',
                        }}>
                        <Button
                            label="All nuggs"
                            onClick={() => setLocalViewing('all nuggs')}
                            buttonStyle={{
                                background:
                                    localViewing === 'all nuggs'
                                        ? 'white'
                                        : 'transparent',
                            }}
                        />
                        <Button
                            label="On sale"
                            onClick={() => setLocalViewing('on sale')}
                            buttonStyle={{
                                background:
                                    localViewing === 'on sale'
                                        ? 'white'
                                        : 'transparent',
                            }}
                        />
                    </div>
                    <NuggList
                        values={
                            localViewing === 'all nuggs'
                                ? allNuggs
                                : activeNuggs
                        }
                        localViewing={localViewing}
                        setLocalViewing={setLocalViewing}
                        onScrollEnd={onScrollEnd}
                        style={{
                            height: '95%',
                            width: '100%',
                            position: 'relative',
                        }}
                    />
                </>
            ) : (
                <>
                    <TransitionText
                        Icon={ChevronLeft}
                        style={{
                            marginTop: '.12rem',
                        }}
                        text={ucFirst(localViewing)}
                        transitionText="Go back"
                        onClick={() => {
                            TokenState.dispatch.setTokenFromId('');
                        }}
                    />
                    <ViewingNugg />
                </>
            )}
        </div>
    );
};

export default SearchView;
