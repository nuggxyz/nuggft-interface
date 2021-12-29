import React, {
    FunctionComponent,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import {
    animated,
    config,
    useSpring,
    useSpringRef,
    useTransition,
} from '@react-spring/web';

import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
} from '../../../../lib';
import NuggDexState from '../../../../state/nuggdex';
import activeNuggsQuery from '../../../../state/nuggdex/queries/activeNuggsQuery';
import ProtocolState from '../../../../state/protocol';
import constants from '../../../../lib/constants';
import allNuggsQuery from '../../../../state/nuggdex/queries/allNuggsQuery';

import NuggList from './components/NuggList';
import NuggLink from './components/NuggLink';
import styles from './NuggDexSearchList.styles';

type Props = {};
const NuggDexSearchList: FunctionComponent<Props> = () => {
    const epoch = ProtocolState.select.epoch();
    const filters = NuggDexState.select.searchFilters();

    const [localViewing, setLocalViewing] =
        useState<NL.Redux.NuggDex.SearchViews>('home');
    const [allNuggs, setAllNuggs] = useState<string[]>([]);
    const [activeNuggs, setActiveNuggs] = useState<string[]>([]);
    const recents = NuggDexState.select.recents();

    const [nuggLinkRef, setNuggLinkRef] = useState<HTMLDivElement>();
    const homeRef = useRef<HTMLDivElement>();

    const [nuggLinkRect, setNuggLinkRect] = useState<any>();
    const [homeRect, setHomeRect] = useState<any>();

    useEffect(() => {
        if (!isUndefinedOrNullOrObjectEmpty(nuggLinkRef)) {
            setNuggLinkRect(nuggLinkRef.getBoundingClientRect());
        }
    }, [nuggLinkRef, localViewing]);

    useEffect(() => {
        homeRef &&
            homeRef.current &&
            setHomeRect(homeRef.current.getBoundingClientRect());
    }, [homeRef]);

    const transRef = useSpringRef();
    const transitions = useTransition(
        localViewing,
        {
            ref: transRef,
            keys: null,
            from: {
                left: nuggLinkRect
                    ? `${nuggLinkRect.left - homeRect.left}px`
                    : '0px',
                top: nuggLinkRect
                    ? `${nuggLinkRect.top - homeRect.top}px`
                    : '0px',
                width: localViewing === 'all nuggs' ? '90%' : '35%',
                height: '35%',
                opacity: 0,
            },
            enter: styles.nuggListEnter,
            leave: {
                left: nuggLinkRect
                    ? `${nuggLinkRect.left - homeRect.left}px`
                    : '600px',
                top: nuggLinkRect
                    ? `${nuggLinkRect.top - homeRect.top}px`
                    : '600px',
                width: localViewing === 'all nuggs' ? '90%' : '30%',
                height: '30%',
                opacity: 0,
            },
            config: config.default,
        },
        [nuggLinkRect, homeRect],
    );

    const animatedStyle = useSpring({
        ...styles.nuggLinksContainer,
        opacity: localViewing !== 'home' ? 0 : 1,
        transform: localViewing !== 'home' ? 'scale(0.9)' : 'scale(1)',
    });

    useEffect(() => {
        nuggLinkRect && transRef.start();
    }, [nuggLinkRect, transRef]);

    const values = useMemo(() => {
        switch (localViewing) {
            case 'all nuggs':
                return allNuggs;
            case 'on sale':
                return activeNuggs;
            case 'recently viewed':
                return recents;
            case 'home':
                return [];
        }
    }, [localViewing, activeNuggs, allNuggs, recents]);

    const handleGetActive = useCallback(
        async (
            setResults: any,
            startFrom: number,
            addToResult: boolean = false,
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
                const ids = activeNuggs.map((active) => active.nugg.id);
                setResults((res) => (addToResult ? [...res, ...ids] : ids));
            }
            setLoading && setLoading(false);
        },
        [epoch, filters],
    );

    const handleGetAll = useCallback(
        async (
            setResults: any,
            startFrom: number,
            addToResult: boolean = false,
            setLoading?: React.Dispatch<SetStateAction<boolean>>,
        ) => {
            setLoading && setLoading(true);
            const allNuggs = (
                await allNuggsQuery(
                    filters.sort.by,
                    filters.sort.asc ? 'asc' : 'desc',
                    filters.searchValue,
                    constants.NUGGDEX_SEARCH_LIST_CHUNK,
                    startFrom,
                )
            ).reduce((map, all) => {
                map[all.nugg.id] = all.nugg.id;
                return map;
                //@ts-ignore
            }, {});
            const ids = Object.keys(allNuggs);
            setResults((res) => (addToResult ? [...res, ...ids] : ids));
            setLoading && setLoading(false);
        },
        [filters],
    );

    const onScrollEnd = useCallback(
        (setLoading?: React.Dispatch<SetStateAction<boolean>>) => {
            switch (localViewing) {
                case 'all nuggs':
                    return handleGetAll(
                        setAllNuggs,
                        allNuggs.length,
                        true,
                        setLoading,
                    );
                case 'on sale':
                    return handleGetActive(
                        setActiveNuggs,
                        activeNuggs.length,
                        true,
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
        handleGetAll(setAllNuggs, 0);
        handleGetActive(setActiveNuggs, 0);
    }, []);

    return (
        <div ref={homeRef} style={styles.searchListContainer}>
            <animated.div style={animatedStyle}>
                <NuggLink
                    localViewing={localViewing}
                    onClick={setLocalViewing}
                    setRef={setNuggLinkRef}
                    type="recently viewed"
                    previewNuggs={recents}
                />
                <NuggLink
                    localViewing={localViewing}
                    onClick={setLocalViewing}
                    setRef={setNuggLinkRef}
                    type="on sale"
                    previewNuggs={activeNuggs}
                />
                <NuggLink
                    localViewing={localViewing}
                    onClick={setLocalViewing}
                    setRef={setNuggLinkRef}
                    type="all nuggs"
                    previewNuggs={allNuggs}
                    style={{ width: '90%' }}
                    limit={7}
                />
            </animated.div>
            {transitions[0]((style, i) => {
                return (
                    i !== 'home' && (
                        <NuggList
                            style={style}
                            values={values}
                            setLocalViewing={setLocalViewing}
                            localViewing={localViewing}
                            onScrollEnd={onScrollEnd}
                        />
                    )
                );
            })}
        </div>
    );
};

export default React.memo(NuggDexSearchList);
