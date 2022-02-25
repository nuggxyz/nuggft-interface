import React, { FunctionComponent, useCallback, useRef } from 'react';
import { IoWalletSharp, IoBookSharp } from 'react-icons/io5';
import { animated, config, useSpring } from 'react-spring';

import Button from '../../../components/general/Buttons/Button/Button';
import ChainIndicator from '../../../components/general/Buttons/ChainIndicator/ChainIndicator';
import useSetState from '../../../hooks/useSetState';
import Colors from '../../../lib/colors';
import Layout from '../../../lib/layout';
import AppState from '../../../state/app';
import ProtocolState from '../../../state/protocol';
import TokenState from '../../../state/token';

import styles from './BottomBar.styles';

const INDEX = {
    Search: -1,
    Mint: 0,
    Wallet: 1,
};

type Props = {};

const BottomBar: FunctionComponent<Props> = () => {
    const nuggSelected = TokenState.select.tokenId();
    const mobileView = AppState.select.mobileView();
    const onClick = useCallback((view: NL.Redux.App.MobileViews) => {
        AppState.dispatch.changeMobileView(view);
    }, []);
    const epoch = ProtocolState.select.epoch();
    const ref = useRef<HTMLDivElement>();

    const width = useSetState(
        () => {
            return ref.current ? ref.current.clientWidth : 0;
        },
        [ref],
        0,
    );

    const selectionIndicatorSpring = useSpring({
        from: {
            opacity: 0,
            position: 'absolute',
        },
        to: {
            opacity: 1,
            height: '45px',
            background: Colors.nuggBlueTransparent,
            width: INDEX[mobileView] === 0 ? '200px' : '45px',
            borderRadius: Layout.borderRadius.large,
            transform: `translate(${INDEX[mobileView] * (width / 2 - 25)}px, 0px)`,
        },
        config: config.default,
    });

    return (
        <div style={styles.fixed}>
            <div style={styles.container} ref={ref}>
                <div
                    style={{
                        display: 'flex',
                        width,
                        position: 'absolute',
                        justifyContent: 'center',
                        height: '100%',
                        alignItems: 'center',
                    }}>
                    <animated.div
                        //@ts-ignore
                        style={selectionIndicatorSpring}
                    />
                </div>
                <Button
                    onClick={() =>
                        nuggSelected && mobileView === 'Search'
                            ? TokenState.dispatch.setNugg(undefined)
                            : onClick('Search')
                    }
                    hoverStyle={{
                        opacity: 1,
                    }}
                    leftIcon={
                        <IoBookSharp
                            color={mobileView === 'Search' ? Colors.nuggBlueText : 'white'}
                            size="25"
                        />
                    }
                    buttonStyle={styles.button}
                />
                <ChainIndicator
                    style={{ background: 'transparent', margin: '.3rem 0rem' }}
                    textStyle={{
                        color: mobileView === 'Mint' ? Colors.nuggBlueText : 'white',
                    }}
                    onClick={mobileView !== 'Mint' && (() => onClick('Mint'))}
                />
                <Button
                    onClick={() => onClick('Wallet')}
                    rightIcon={
                        <IoWalletSharp
                            color={mobileView === 'Wallet' ? Colors.nuggBlueText : 'white'}
                            size="25"
                        />
                    }
                    hoverStyle={{
                        opacity: 1,
                    }}
                    buttonStyle={styles.button}
                />
            </div>
        </div>
    );
};

export default BottomBar;
