import React, { FunctionComponent, useMemo } from 'react';
import { animated, config, useSpring } from '@react-spring/web';
import { IoChevronBackOutline } from 'react-icons/io5';

import Button from '@src/components/general/Buttons/Button/Button';
import ViewingNugg from '@src/components/nugg/ViewingNugg/ViewingNugg';
import Colors from '@src/lib/colors';
import Layout from '@src/lib/layout';
import TokenState from '@src/state/token';
import FontSize from '@src/lib/fontSize';
import HappyTabber, { HappyTabberItem } from '@src/components/general/HappyTabber/HappyTabber';

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
                }}
            >
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
                }}
            >
                <ViewingNugg
                    MobileBackButton={() => (
                        <Button
                            leftIcon={
                                <IoChevronBackOutline color={Colors.nuggBlueText} size="25" />
                            }
                            // label="Back"
                            onClick={() => TokenState.dispatch.setNugg(undefined)}
                            buttonStyle={{
                                background: Colors.transparentWhite,
                                borderRadius: Layout.borderRadius.large,
                                padding: '0.4rem',
                            }}
                            textStyle={{
                                fontFamily: Layout.font.sf.light,
                                color: Colors.nuggBlueText,
                                fontSize: FontSize.h6,
                            }}
                        />
                    )}
                />
            </animated.div>
        </>
    );
};

export default SearchView;
