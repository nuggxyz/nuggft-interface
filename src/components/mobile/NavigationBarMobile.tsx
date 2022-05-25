import React, { FC } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { IoQrCode, IoChevronBackCircle } from 'react-icons/io5';
import { TiHome } from 'react-icons/ti';
import { useMatch, useNavigate } from 'react-router';

import InfoClicker from '@src/components/nuggbook/InfoClicker';
import lib from '@src/lib';
import web3 from '@src/web3';
import NLStaticImage from '@src/components/general/NLStaticImage';
import NuggDexSearchBarMobile from '@src/components/mobile/NuggDexSearchBarMobile';
import HealthIndicator from '@src/components/general/Buttons/HealthIndicator/HealthIndicator';
import Button from '@src/components/general/Buttons/Button/Button';
import { useOnTapOutside } from '@src/hooks/useOnClickOutside';
import packages from '@src/packages';
import client from '@src/client';
import PageWrapper2 from '@src/components/nuggbook/PageWrapper2';
import { Page } from '@src/interfaces/nuggbook';
import Jazzicon from '@src/components/nugg/Jazzicon';

export const useOpacitate = (arg: boolean | undefined) => {
    const [exit, exitToAnimate] = React.useMemo(() => {
        const opacity = arg ? 1 : 0;

        const pointerEvents = opacity === 0 ? ('none' as const) : ('auto' as const);

        const zIndex = opacity === 0 ? { zIndex: -1 } : {};

        return [
            {
                pointerEvents,
                ...zIndex,
            },
            {
                opacity,
            },
        ];
    }, [arg]);

    const [exitAnimated] = useSpring(() => {
        return {
            ...exitToAnimate,
            config: packages.spring.config.stiff,
        };
    }, [exitToAnimate]);

    return {
        ...exit,
        ...exitAnimated,
    };
};

const NavigationBarMobile: FC<unknown> = () => {
    const navigate = useNavigate();

    const address = web3.hook.usePriorityAccount();

    const [searchOpenCore, setSearchOpen] = React.useState<boolean>(false);

    const [manualMatch, setManualMatch] = React.useState<boolean>(false);

    const matchToken = useMatch('/swap/:id');

    // const MOVE_DELAY = 800;
    const nuggbookPage = client.nuggbook.useNuggBookPage();
    const close = client.nuggbook.useCloseNuggBook();

    const nuggbookOpen = React.useDeferredValue(client.nuggbook.useOpen());
    const isFull = React.useDeferredValue(manualMatch);
    const searchOpen = React.useDeferredValue(searchOpenCore);

    const [floater] = useSpring(
        {
            width: isFull ? '100%' : '0%',
            config: packages.spring.config.stiff,
        },
        [isFull],
    );

    /* ////////////////////////////////////////////////////////////////////////
       search
    //////////////////////////////////////////////////////////////////////// */

    const searchOpacitate = useOpacitate(
        React.useMemo(() => isFull && !nuggbookOpen, [isFull, nuggbookOpen]),
    );

    /* ////////////////////////////////////////////////////////////////////////
       middle
    //////////////////////////////////////////////////////////////////////// */

    const middleOpacitate = useOpacitate(
        React.useMemo(
            () => isFull && !nuggbookOpen && !searchOpen,
            [isFull, nuggbookOpen, searchOpen],
        ),
    );

    /* ////////////////////////////////////////////////////////////////////////
       close
    //////////////////////////////////////////////////////////////////////// */

    // const closeOpacitate = useOpacitate(React.useMemo(() => nuggbookOpen, [nuggbookOpen]));

    /* ////////////////////////////////////////////////////////////////////////
       jazz
    //////////////////////////////////////////////////////////////////////// */

    const backOpacitate = useOpacitate(
        React.useMemo(
            () => isFull && !!matchToken && !searchOpen && !nuggbookOpen,
            [nuggbookOpen, searchOpen, matchToken, isFull],
        ),
    );

    const [searchOpenUp] = useSpring(
        {
            height: searchOpen
                ? '450px'
                : nuggbookOpen
                ? nuggbookPage === Page.Start
                    ? '250px'
                    : '600px'
                : '75px',

            config: packages.spring.config.stiff,
        },
        [searchOpen, nuggbookOpen, nuggbookPage],
    );

    const [nuggbookFade] = useSpring(
        {
            opacity: nuggbookOpen ? 1 : 0,

            config: packages.spring.config.stiff,
        },
        [nuggbookOpen],
    );

    const ref = React.useRef(null);

    useOnTapOutside(
        ref,
        React.useCallback(() => {
            console.log('YEP');
            if (nuggbookOpen) close();
            else if (searchOpen) setSearchOpen(false);
            else if (manualMatch) setManualMatch(false);
        }, [searchOpen, manualMatch, nuggbookOpen, close]),
    );

    return (
        <animated.div
            ref={ref}
            aria-hidden="true"
            style={{
                display: 'flex',
                position: 'absolute',
                bottom: 0,
                width: '100%',
                zIndex: 1000,
                alignItems: 'center',
                justifyContent: 'flex-end',
                transition: `all 0.3s ${lib.layout.animation}`,
                marginBottom: 15,
                pointerEvents: 'none',
            }}
        >
            <animated.div
                style={{
                    zIndex: 3,
                    display: 'flex',
                    alignItems: searchOpen ? 'flex-start' : nuggbookOpen ? 'flex-end' : 'flex-end',
                    WebkitBackdropFilter: 'blur(50px)',
                    backdropFilter: 'blur(50px)',
                    minWidth: '75px',
                    marginRight: 15,
                    marginLeft: 15,
                    ...searchOpenUp,
                    position: 'relative',
                    borderRadius: lib.layout.borderRadius.medium,
                    background: lib.colors.transparentWhite,
                    boxShadow: lib.layout.boxShadow.dark,
                    overflow: 'hidden',
                    ...floater,
                }}
            >
                {/* ////////////////////////////////////////////////////////////////////////
                    search
                //////////////////////////////////////////////////////////////////////// */}
                <animated.div
                    className={isFull && !searchOpen ? 'mobile-pressable-div' : undefined}
                    style={{
                        zIndex: 8,
                        display: 'flex',
                        justifyContent: 'flex-start',
                        position: 'absolute',
                        ...(searchOpen ? { width: '100%', height: '100%' } : { left: 0 }),
                        ...searchOpacitate,
                    }}
                >
                    <NuggDexSearchBarMobile
                        openable={isFull}
                        setOpen={setSearchOpen}
                        open={searchOpen}
                    />
                </animated.div>

                {/* ////////////////////////////////////////////////////////////////////////
                    middle
                //////////////////////////////////////////////////////////////////////// */}
                <animated.div
                    style={{
                        zIndex: 7,
                        width: '100%',
                        position: 'absolute',
                        height: '75px',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        right: 0,
                        left: 0,
                        ...middleOpacitate,
                    }}
                >
                    <animated.div
                        style={{
                            height: '100%',
                            width: '200px',
                            margin: 'none',
                            display: 'flex',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                        }}
                    >
                        <HealthIndicator />
                        <NLStaticImage image="nuggbutton" />
                        <InfoClicker
                            size={45}
                            color={lib.colors.nuggBlueSemiTransparent}
                            buttonStyle={{ padding: 0 }}
                        />
                    </animated.div>
                </animated.div>

                {/* ////////////////////////////////////////////////////////////////////////
                    closer
                //////////////////////////////////////////////////////////////////////// */}
                {/*
                <animated.div
                    id="hi-there-bob"
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',

                        width: '100%',
                        padding: 20,
                        zIndex: 8,
                        ...closeOpacitate,
                    }}
                >
                    <Button
                        className="mobile-pressable-div"
                        buttonStyle={{
                            backgroundColor: lib.colors.transparentWhite,
                            color: lib.colors.primaryColor,
                            borderRadius: lib.layout.borderRadius.mediumish,

                            alignItems: 'center',
                        }}
                        textStyle={{ ...lib.layout.presets.font.main.thicc }}
                        label="menu"
                        leftIcon={
                            <IoIosMenu
                                color={lib.colors.primaryColor}
                                style={{ marginRight: '.3rem' }}
                                size={20}
                            />
                        }
                        onClick={() => {
                            close();
                        }}
                    />
                    <Button
                        className="mobile-pressable-div"
                        buttonStyle={{
                            backgroundColor: lib.colors.transparentWhite,
                            color: lib.colors.primaryColor,
                            borderRadius: lib.layout.borderRadius.mediumish,

                            alignItems: 'center',
                        }}
                        textStyle={{ ...lib.layout.presets.font.main.thicc }}
                        label="close"
                        leftIcon={
                            <IoIosCloseCircle
                                color={lib.colors.primaryColor}
                                style={{ marginRight: '.3rem' }}
                                size={20}
                            />
                        }
                        onClick={() => {
                            close();
                        }}
                    />
                </animated.div> */}

                {/* ////////////////////////////////////////////////////////////////////////
                    jazz
                //////////////////////////////////////////////////////////////////////// */}
                <animated.div
                    // className="mobile-pressable-div"
                    style={{
                        zIndex: 8,
                        position: 'absolute',
                        right: 0,
                        display: 'flex',
                        alignItems: 'center',
                        // padding: 12,
                        height: '75px',
                        width: '75px',
                        borderRadius: lib.layout.borderRadius.medium,
                        justifySelf: 'center',
                        pointerEvents: 'auto',
                        // ...jazzOpacitate,
                    }}
                >
                    <HomeButton
                        onClick={React.useCallback(() => {
                            console.log('ahhhhhhhhh');

                            if (nuggbookOpen) close();
                            else {
                                console.log('yeppers');
                                setManualMatch(!manualMatch);
                            }
                        }, [manualMatch, nuggbookOpen, close])}
                        isFull={isFull}
                    />
                </animated.div>

                {/* ////////////////////////////////////////////////////////////////////////
                    the nuggbook
                //////////////////////////////////////////////////////////////////////// */}
                <animated.div
                    style={{
                        zIndex: 4,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        display: 'flex',
                        // width: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden',
                        justifyContent: 'flex-start',

                        WebkitMaskImage: 'linear-gradient(180deg, #000 90%, transparent)',
                        ...nuggbookFade,
                    }}
                >
                    <PageWrapper2 />
                </animated.div>
            </animated.div>
            {/* ////////////////////////////////////////////////////////////////////////
                    account
                //////////////////////////////////////////////////////////////////////// */}
            <animated.div
                // className="mobile-pressable-div"
                style={{
                    zIndex: 10,
                    position: 'absolute',
                    left: 15,
                    top: -50,
                    display: 'flex',
                    alignItems: 'center',
                    // padding: 12,
                    // height: '75px',
                    // width: '75px',
                    borderRadius: lib.layout.borderRadius.medium,
                    justifySelf: 'center',
                    ...searchOpacitate,
                }}
            >
                <NoFlash2 address={address} isFull={isFull} />
            </animated.div>

            {/* ////////////////////////////////////////////////////////////////////////
                    back button
                //////////////////////////////////////////////////////////////////////// */}
            <animated.div
                style={{
                    zIndex: 10,
                    position: 'absolute',
                    right: 15,
                    top: -100,
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    borderRadius: lib.layout.borderRadius.medium,
                    justifySelf: 'center',
                    ...backOpacitate,
                }}
            >
                <Button
                    className="mobile-pressable-div"
                    buttonStyle={{
                        backgroundColor: lib.colors.transparentWhite,
                        color: lib.colors.primaryColor,
                        borderRadius: lib.layout.borderRadius.mediumish,
                        WebkitBackdropFilter: 'blur(50px)',
                        backdropFilter: 'blur(50px)',
                        alignItems: 'center',
                    }}
                    textStyle={{ ...lib.layout.presets.font.main.thicc }}
                    label="back"
                    leftIcon={
                        <IoChevronBackCircle
                            color={lib.colors.primaryColor}
                            style={{ marginRight: '.3rem' }}
                            size={20}
                        />
                    }
                    onClick={() => {
                        navigate(-1);
                        setManualMatch(false);
                    }}
                />
            </animated.div>

            {/* ////////////////////////////////////////////////////////////////////////
                    home button
                //////////////////////////////////////////////////////////////////////// */}
            <animated.div
                style={{
                    zIndex: 10,
                    position: 'absolute',
                    right: 15,
                    top: -50,
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    borderRadius: lib.layout.borderRadius.medium,
                    justifySelf: 'center',
                    ...backOpacitate,
                }}
            >
                <Button
                    className="mobile-pressable-div"
                    buttonStyle={{
                        backgroundColor: lib.colors.transparentWhite,
                        color: lib.colors.primaryColor,
                        borderRadius: lib.layout.borderRadius.mediumish,
                        WebkitBackdropFilter: 'blur(50px)',
                        backdropFilter: 'blur(50px)',
                        alignItems: 'center',
                    }}
                    textStyle={{ ...lib.layout.presets.font.main.thicc }}
                    label="home"
                    leftIcon={
                        <TiHome
                            color={lib.colors.primaryColor}
                            style={{ marginRight: '.3rem' }}
                            size={20}
                        />
                    }
                    onClick={() => {
                        navigate('/');
                        setManualMatch(false);
                    }}
                />
            </animated.div>
        </animated.div>
    );
};

export const NoFlash2 = React.memo<{
    address?: string;
    isFull: boolean;
    // onClick: (full: boolean) => void;
}>(
    ({ address }) => {
        const provider = web3.hook.usePriorityProvider();
        const ens = web3.hook.usePriorityAnyENSName(provider, address || '');
        return (
            <Button
                className="mobile-pressable-div"
                buttonStyle={{
                    backgroundColor: lib.colors.transparentWhite,
                    color: lib.colors.primaryColor,
                    borderRadius: lib.layout.borderRadius.mediumish,
                    WebkitBackdropFilter: 'blur(50px)',
                    backdropFilter: 'blur(50px)',
                    alignItems: 'center',
                }}
                textStyle={{ ...lib.layout.presets.font.main.thicc }}
                label={ens || 'connect wallet'}
                leftIcon={
                    <div
                        className="mobile-pressable-div-deep"
                        style={{
                            position: 'relative',
                            justifyContent: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            paddingRight: '10px',
                        }}
                    >
                        {address ? (
                            <Jazzicon address={address || ''} size={20} className="" />
                        ) : (
                            <IoQrCode
                                style={{
                                    color: lib.colors.semiTransparentPrimaryColor,
                                }}
                                size={20}
                            />
                        )}
                    </div>
                }
                onClick={() => {}}
            />
        );
    },
    (a, b) => a.address === b.address && a.isFull === b.isFull,
);

export const NoFlash = React.memo<{
    address?: string;
    isFull: boolean;
    onClick: (full: boolean) => void;
}>(
    ({ address, onClick, isFull }) => {
        return (
            <Button
                rightIcon={
                    <div
                        className="mobile-pressable-div-deep"
                        style={{
                            height: 55,
                            width: 55,
                            position: 'relative',
                            justifyContent: 'center',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {address ? (
                            <Jazzicon address={address || ''} size={50} className="" />
                        ) : (
                            <IoQrCode
                                style={{
                                    color: lib.colors.semiTransparentPrimaryColor,
                                }}
                                size={50}
                            />
                        )}
                    </div>
                }
                buttonStyle={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',

                    padding: 0,
                    background: 'transparent',
                    borderRadius: lib.layout.borderRadius.large,
                }}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onClick(isFull);
                }}
            />
        );
    },
    (a, b) => a.address === b.address && a.isFull === b.isFull,
);

export const HomeButton = React.memo<{
    isFull: boolean;
    onClick: (full: boolean) => void;
}>(
    ({ onClick, isFull }) => {
        return (
            <Button
                rightIcon={
                    <div
                        className="concave mobile-pressable-div-deep"
                        style={{
                            height: 55,
                            width: 55,
                            position: 'relative',
                            justifyContent: 'center',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <div
                            style={{
                                border: `2px solid ${lib.colors.transparentPrimaryColor}`,
                                height: 18,
                                width: 18,

                                borderRadius: '5px',
                            }}
                        />
                    </div>
                }
                buttonStyle={{
                    width: '100%',
                    height: '100%',
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 0,
                    background: 'transparent',
                    borderRadius: !isFull ? lib.layout.borderRadius.medium : 0,
                    WebkitTapHighlightColor: 'transparent',
                }}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    console.log('yo');
                    onClick(isFull);
                }}
            />
        );
    },
    (a, b) => a.onClick === b.onClick && a.isFull === b.isFull,
);

export default NavigationBarMobile;
