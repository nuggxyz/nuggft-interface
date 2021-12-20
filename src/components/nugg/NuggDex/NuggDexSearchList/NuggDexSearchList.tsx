import React, {
    FunctionComponent,
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

import { isUndefinedOrNullOrObjectEmpty } from '../../../../lib';
import NuggDexState from '../../../../state/nuggdex';

import NuggList from './components/NuggList';
import NuggLink from './components/NuggLink';
import styles from './NuggDexSearchList.styles';

type Props = {};
const NuggDexSearchList: FunctionComponent<Props> = () => {
    const [localViewing, setLocalViewing] =
        useState<NL.Redux.NuggDex.SearchViews>('home');

    const allNuggs = NuggDexState.select.allNuggs();
    const activeNuggs = NuggDexState.select.activeNuggs();
    const myNuggs = NuggDexState.select.myNuggs();
    const recents = NuggDexState.select.recents();

    const [nuggLinkRef, setNuggLinkRef] = useState<HTMLDivElement>();
    const homeRef = useRef<HTMLDivElement>();

    const [nuggLinkRect, setNuggLinkRect] = useState<any>();
    const [homeRect, setHomeRect] = useState<any>();

    const [beginListSearch, setBeginListSearch] = useState(false);

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
                width: '35%',
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
                width: '30%',
                height: '30%',
                opacity: 0,
            },
            config: config.default,
            onStart: () => {
                NuggDexState.dispatch.setViewing(localViewing);
            },
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
            case 'my nuggs':
                return myNuggs;
            case 'on sale':
                return activeNuggs;
            case 'recently viewed':
                return recents;
            case 'home':
                return [];
        }
    }, [localViewing, activeNuggs, allNuggs, myNuggs, recents]);

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
                    type="my nuggs"
                    previewNuggs={myNuggs}
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
                        />
                    )
                );
            })}
        </div>
    );
};

export default React.memo(NuggDexSearchList);
