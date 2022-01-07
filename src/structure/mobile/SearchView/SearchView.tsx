import React, {
    FunctionComponent,
    SetStateAction,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { ChevronLeft } from 'react-feather';
import { animated, config, useSpring, useTransition } from 'react-spring';
import { IoChevronBackOutline } from 'react-icons/io5';

import Button from '../../../components/general/Buttons/Button/Button';
import TransitionText from '../../../components/general/Texts/TransitionText/TransitionText';
import NuggList from '../../../components/nugg/NuggDex/NuggDexSearchList/components/NuggList';
import ViewingNugg from '../../../components/nugg/ViewingNugg/ViewingNugg';
import { isUndefinedOrNullOrArrayEmpty, ucFirst } from '../../../lib';
import Colors from '../../../lib/colors';
import Layout from '../../../lib/layout';
import TokenState from '../../../state/token';
import FontSize from '../../../lib/fontSize';
import HappyTabber, {
    HappyTabberItem,
} from '../../../components/general/HappyTabber/HappyTabber';

import AllNuggs from './AllNuggs';
import Sales from './Sales';
import Recents from './Recents';
import styles from './SearchView.styles';

type Props = {};

const SearchView: FunctionComponent<Props> = () => {
    const selected = TokenState.select.tokenId();

    const happytabs: HappyTabberItem[] = useMemo(
        () => [
            {
                label: 'All',
                comp: () => <AllNuggs />,
            },
            {
                label: 'Sales',
                comp: () => <Sales />,
            },
            {
                label: 'Recents',
                comp: () => <Recents />,
            },
        ],
        [],
    );

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
                    background: Colors.gradient2,
                }}>
                <HappyTabber
                    items={happytabs}
                    bodyStyle={styles.body}
                    headerTextStyle={styles.headerText}
                />
            </animated.div>
            <animated.div
                style={{
                    opacity,
                    position: 'fixed',
                    pointerEvents: selected ? 'auto' : 'none',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    overflow: 'scroll',
                }}>
                <ViewingNugg />
                <Button
                    leftIcon={
                        <IoChevronBackOutline
                            color={Colors.nuggBlueText}
                            size="25"
                        />
                    }
                    label="Back"
                    onClick={() => TokenState.dispatch.setNugg(undefined)}
                    buttonStyle={{
                        position: 'absolute',
                        bottom: '.5rem',
                        left: '.5rem',
                        background: Colors.nuggBlueTransparent,
                        borderRadius: Layout.borderRadius.large,
                        paddingLeft: '0.4rem',
                    }}
                    textStyle={{
                        fontFamily: Layout.font.inter.light,
                        color: Colors.nuggBlueText,
                        fontSize: FontSize.h6,
                    }}
                />
            </animated.div>
        </>
    );
};

export default SearchView;
