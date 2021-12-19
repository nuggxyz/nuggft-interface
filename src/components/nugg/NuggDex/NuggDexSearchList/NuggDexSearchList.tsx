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
const NuggDexSearchView: FunctionComponent<Props> = () => {
    const viewing = NuggDexState.select.viewing();

    const allNuggs = NuggDexState.select.allNuggs();
    const activeNuggs = NuggDexState.select.activeNuggs();
    const myNuggs = NuggDexState.select.myNuggs();
    const recents = NuggDexState.select.recents();

    const [nuggLinkRef, setNuggLinkRef] = useState<HTMLDivElement>();
    const homeRef = useRef<HTMLDivElement>();

    const [nuggLinkRect, setNuggLinkRect] = useState<any>();
    const [homeRect, setHomeRect] = useState<any>();

    useEffect(() => {
        if (!isUndefinedOrNullOrObjectEmpty(nuggLinkRef)) {
            setNuggLinkRect(nuggLinkRef.getBoundingClientRect());
        }
    }, [nuggLinkRef, viewing]);

    useEffect(() => {
        homeRef &&
            homeRef.current &&
            setHomeRect(homeRef.current.getBoundingClientRect());
    }, [homeRef]);

    const transRef = useSpringRef();
    const transitions = useTransition(
        viewing,
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
        },
        [nuggLinkRect, homeRect],
    );

    const animatedStyle = useSpring({
        ...styles.nuggLinksContainer,
        opacity: viewing !== 'home' ? 0 : 1,
        transform: viewing !== 'home' ? 'scale(0.9)' : 'scale(1)',
    });

    useEffect(() => {
        nuggLinkRect && transRef.start();
    }, [nuggLinkRect, transRef]);

    const values = useMemo(() => {
        switch (viewing) {
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
    }, [viewing, activeNuggs, allNuggs, myNuggs, recents]);

    return (
        <div ref={homeRef} style={styles.searchListContainer}>
            <animated.div style={animatedStyle}>
                <NuggLink
                    setRef={setNuggLinkRef}
                    type="recently viewed"
                    previewNuggs={recents}
                /> 
                <NuggLink
                    setRef={setNuggLinkRef}
                    type="my nuggs"
                    previewNuggs={myNuggs}
                />
                <NuggLink
                    setRef={setNuggLinkRef}
                    type="on sale"
                    previewNuggs={activeNuggs}
                />
                <NuggLink
                    setRef={setNuggLinkRef}
                    type="all nuggs"
                    previewNuggs={allNuggs}
                />
            </animated.div>
            {transitions[0]((style, i) => {
                return (
                    i !== 'home' && <NuggList style={style} values={values} />
                );
            })}
        </div>
    );
};

export default NuggDexSearchView;
