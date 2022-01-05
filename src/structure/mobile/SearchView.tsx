import React, {
    FunctionComponent,
    SetStateAction,
    useCallback,
    useEffect,
    useState,
} from 'react';
import { ChevronLeft } from 'react-feather';
import { animated, config, useSpring, useTransition } from 'react-spring';

import Button from '../../components/general/Buttons/Button/Button';
import TransitionText from '../../components/general/Texts/TransitionText/TransitionText';
import NuggList from '../../components/nugg/NuggDex/NuggDexSearchList/components/NuggList';
import ViewingNugg from '../../components/nugg/ViewingNugg/ViewingNugg';
import { isUndefinedOrNullOrArrayEmpty, ucFirst } from '../../lib';
import Colors from '../../lib/colors';
import constants from '../../lib/constants';
import globalStyles from '../../lib/globalStyles';
import Layout from '../../lib/layout';
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
    const [loading, setLoading] = useState(false);

    const [allNuggs, setAllNuggs] = useState<
        NL.GraphQL.Fragments.Nugg.ListItem[]
    >([]);
    const [activeNuggs, setActiveNuggs] = useState<
        NL.GraphQL.Fragments.Nugg.ListItem[]
    >([]);

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
                filters ? filters.sort.by : 'id',
                filters && filters.sort.asc ? 'asc' : 'desc',
                filters ? filters.searchValue : '',
                epoch.id,
                constants.NUGGDEX_SEARCH_LIST_CHUNK,
                startFrom,
            );
            if (!isUndefinedOrNullOrArrayEmpty(activeNuggs)) {
                setResults((res) =>
                    addToResult ? [...res, ...activeNuggs] : activeNuggs,
                );
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

    useEffect(() => {
        onScrollEnd({ setLoading });
    }, []);

    const { opacity } = useSpring({
        opacity: selected ? 1 : 0,
        config: config.default,
    });

    return (
        <>
            <animated.div
                style={{
                    opacity: opacity.to([1, 0], [0, 1]),
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    pointerEvents: !selected ? 'auto' : 'none',
                    justifyContent: 'center',
                    display: 'flex',
                }}>
                <Button
                    label="Sales"
                    onClick={() =>
                        setLocalViewing((view) =>
                            view === 'on sale' ? 'all nuggs' : 'on sale',
                        )
                    }
                    textStyle={{
                        color:
                            localViewing === 'on sale'
                                ? 'white'
                                : Colors.nuggBlueText,
                        transition: 'color .3s ease-in',
                    }}
                    buttonStyle={{
                        zIndex: 1,
                        position: 'absolute',
                        bottom: '0rem',
                        margin: '0 auto',
                        ...globalStyles.backdropFilter,
                        background:
                            localViewing === 'on sale'
                                ? Colors.nuggBlueText
                                : Colors.nuggBlueTransparent,
                        borderRadius: Layout.borderRadius.large,
                        transition: 'background .3s ease-in',
                    }}
                />
                <NuggList
                    values={
                        localViewing === 'all nuggs' ? allNuggs : activeNuggs
                    }
                    localViewing={localViewing}
                    setLocalViewing={setLocalViewing}
                    onScrollEnd={onScrollEnd}
                    style={{
                        height: '100%',
                        zIndex: 0,
                        width: '100%',
                        position: 'fixed',
                        background: 'transparent',
                    }}
                />
            </animated.div>
            <animated.div
                style={{
                    opacity,
                    position: 'absolute',
                    pointerEvents: selected ? 'auto' : 'none',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                }}>
                <ViewingNugg />
            </animated.div>
        </>
    );
};

export default SearchView;
