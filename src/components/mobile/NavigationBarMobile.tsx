import React, { CSSProperties, FC } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { IoQrCode, IoSearch } from 'react-icons/io5';
import { useMatch, useNavigate } from 'react-router';

import InfoClicker from '@src/components/nuggbook/InfoClicker';
import lib from '@src/lib';
import web3 from '@src/web3';
import NLStaticImage from '@src/components/general/NLStaticImage';
import Button from '@src/components/general/Buttons/Button/Button';
import { useOnTapOutside } from '@src/hooks/useOnClickOutside';
import packages from '@src/packages';
import client from '@src/client';
import PageWrapper2 from '@src/components/nuggbook/PageWrapper2';
import { Page } from '@src/interfaces/nuggbook';
import Jazzicon from '@src/components/nugg/Jazzicon';
import CurrencyToggler from '@src/components/general/Buttons/CurrencyToggler/CurrencyToggler';
import { ModalEnum } from '@src/interfaces/modals';
import usePrevious from '@src/hooks/usePrevious';
import IconButton from '@src/components/general/Buttons/IconButton/IconButton';

export const useOpacitate = (name: string, arg: boolean | undefined) => {
    const [exit, exitToAnimate, staticStyles] = React.useMemo(() => {
        const opacity = arg ? 1 : 0;

        const pointerEvents = opacity === 0 ? ('none' as const) : ('auto' as const);

        const zIndex =
            opacity === 0
                ? { [`--${name}-zIndex` as const]: -1, [`--${name}-boxShadow` as const]: undefined }
                : undefined;

        return [
            {
                [`--${name}-pointerEvents` as const]: pointerEvents,
                ...zIndex,
            } as const,
            {
                [`--${name}-opacity` as const]: opacity,
            },
            {
                pointerEvents: `var(--${name}-pointerEvents)` as CSSProperties[`pointerEvents`],
                opacity: `var(--${name}-opacity)` as CSSProperties[`opacity`],
                ...(zIndex && {
                    zIndex: `var(--${name}-zIndex)` as CSSProperties[`zIndex`],
                    boxShadow: `var(--${name}-boxShadow)` as CSSProperties[`boxShadow`],
                }),
            } as const,
        ];
    }, [arg, name]);

    const [exitAnimated] = useSpring(() => {
        return {
            ...exitToAnimate,
            config: packages.spring.config.stiff,
        };
    }, [exitToAnimate]);

    const animatedStyles = {
        ...exit,
        ...exitAnimated,
    } as const;

    return [staticStyles, animatedStyles] as const;
};

const NavigationBarMobile: FC<unknown> = () => {
    const navigate = useNavigate();

    const address = web3.hook.usePriorityAccount();

    // const [searchOpenCore, setSearchOpen] = React.useState<boolean>(false);

    const [manualMatch, setManualMatch] = React.useState<boolean>(true);

    const matchHome = useMatch('/');

    const close = client.nuggbook.useCloseNuggBook();
    const nuggbookGoto = client.nuggbook.useGotoOpen();

    const setCurrencyPreference = client.usd.useSetCurrencyPreferrence();
    const currencyPreferrence = client.usd.useCurrencyPreferrence();
    const nuggbookOpen = React.useDeferredValue(client.nuggbook.useOpen());
    const nuggbookPage = React.useDeferredValue(client.nuggbook.useNuggBookPage());

    const isFull = React.useDeferredValue(manualMatch);
    // const searchOpen = React.useDeferredValue(searchOpenCore);

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

    const [opacitate, opacitateAnimated] = useOpacitate(
        'mobile-nav',
        React.useMemo(() => isFull && !nuggbookOpen, [isFull, nuggbookOpen]),
    );

    const [nuggbookOpenUp] = useSpring(
        {
            height: nuggbookOpen ? (nuggbookPage === Page.Start ? '250px' : '600px') : '75px',

            config: packages.spring.config.stiff,
        },
        [nuggbookOpen, nuggbookPage],
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
            if (nuggbookOpen) close();
            // purposfully last - dont want to fully close the square if something is open
            else if (manualMatch) setManualMatch(false);
        }, [manualMatch, nuggbookOpen, close]),
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
                ...opacitateAnimated,
            }}
        >
            <animated.div
                style={{
                    zIndex: 3,
                    display: 'flex',
                    alignItems: 'flex-end',
                    WebkitBackdropFilter: 'blur(50px)',
                    backdropFilter: 'blur(50px)',
                    minWidth: '75px',
                    marginRight: 15,
                    marginLeft: 15,
                    ...nuggbookOpenUp,
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
                    className={isFull ? 'mobile-pressable-div' : undefined}
                    style={{
                        zIndex: 8,
                        display: 'flex',
                        justifyContent: 'flex-start',
                        position: 'absolute',
                        ...opacitate,
                    }}
                >
                    <IconButton
                        aria-hidden="true"
                        buttonStyle={{
                            padding: 0,
                            height: 75,
                            width: 75,
                            background: 'transparent',
                            borderRadius: lib.layout.borderRadius.large,
                        }}
                        onClick={() => {
                            nuggbookGoto(Page.Search);
                        }}
                        iconComponent={
                            <IoSearch
                                style={{
                                    color: lib.colors.semiTransparentPrimaryColor,
                                }}
                                size={50}
                            />
                        }
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
                        ...opacitate,
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
                        <Button
                            buttonStyle={{
                                padding: 0,
                                background: 'transparent',
                            }}
                            rightIcon={<span>💬</span>}
                            onClick={() => nuggbookGoto(Page.Feedback)}
                        />
                        <NLStaticImage image="nuggbutton" />
                        <InfoClicker
                            size={45}
                            to={Page.TableOfContents}
                            color={lib.colors.nuggBlueSemiTransparent}
                            buttonStyle={{ padding: 0 }}
                        />
                        {/* <Button
                            buttonStyle={{
                                padding: 0,
                                background: 'transparent',
                            }}
                            rightIcon={<span>ℹ️</span>}
                            onClick={() => nuggbookGoto(Page.TableOfContents)}
                        /> */}
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
                    home
                //////////////////////////////////////////////////////////////////////// */}
                <animated.div
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
                    }}
                >
                    <HomeButton
                        onClick={React.useCallback(() => {
                            if (nuggbookOpen) close();
                            else if (!manualMatch) setManualMatch(true);
                            // eslint-disable-next-line no-useless-return
                            else if (matchHome) setManualMatch(false);
                            else {
                                navigate('/');
                            }
                        }, [manualMatch, nuggbookOpen, close, navigate, matchHome])}
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

                {/*
                <animated.div
                    style={{
                        zIndex: 4,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        display: 'flex',
                        // height: '100%',
                        width: '100%',
                        justifyContent: 'flex-start',
                        overflow: 'scroll',
                        WebkitMaskImage: 'linear-gradient(180deg, #000 90%, transparent)',
                        ...walletOpacitate,
                    }}
                >
                    <ConnectTab />
                </animated.div> */}
            </animated.div>

            {/* ////////////////////////////////////////////////////////////////////////
                    claim button
                //////////////////////////////////////////////////////////////////////// */}
            <animated.div
                style={{
                    zIndex: 10,
                    position: 'absolute',
                    left: 15,
                    top: -100,
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: lib.layout.borderRadius.medium,
                    justifySelf: 'center',
                    boxShadow: address ? lib.layout.boxShadow.dark : undefined,
                    ...opacitate,
                }}
            >
                <NoFlashClaims address={address} />
            </animated.div>

            {/* ////////////////////////////////////////////////////////////////////////
                    account
                //////////////////////////////////////////////////////////////////////// */}
            <animated.div
                style={{
                    zIndex: 10,
                    position: 'absolute',
                    left: 15,
                    top: -50,
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: lib.layout.borderRadius.medium,
                    justifySelf: 'center',
                    ...opacitate,
                    boxShadow: lib.layout.boxShadow.dark,
                }}
            >
                <NoFlash2
                    address={address}
                    onClick={React.useCallback(() => {
                        if (address) navigate('/wallet');
                        else nuggbookGoto(Page.Connect);
                    }, [address, navigate, nuggbookGoto])}
                />
            </animated.div>

            {/* ////////////////////////////////////////////////////////////////////////
                    currency toggler
                //////////////////////////////////////////////////////////////////////// */}
            <animated.div
                // className="mobile-pressable-div"
                style={{
                    zIndex: 10,
                    position: 'absolute',
                    right: 15,
                    top: -45,
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: lib.layout.borderRadius.medium,
                    justifySelf: 'center',
                    ...opacitateAnimated,
                    ...opacitate,
                }}
            >
                <CurrencyToggler
                    setPref={(input) => {
                        setCurrencyPreference(input);
                        return undefined;
                    }}
                    floaterStyle={{ boxShadow: lib.layout.boxShadow.dark }}
                    pref={currencyPreferrence}
                />
            </animated.div>

            {/* ////////////////////////////////////////////////////////////////////////
                    connection health
                //////////////////////////////////////////////////////////////////////// */}
            <div
                // className="mobile-pressable-div"
                style={{
                    zIndex: 10,
                    position: 'absolute',
                    right: 15,
                    top: -100,
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: lib.layout.borderRadius.medium,
                    justifySelf: 'center',
                    ...opacitate,
                }}
            >
                <NoFlashStatus address={address} />
            </div>

            {/* ////////////////////////////////////////////////////////////////////////
                    back button
                //////////////////////////////////////////////////////////////////////// */}
            {/* <animated.div
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
            </animated.div> */}
        </animated.div>
    );
};

export const NoFlashClaims = React.memo<{
    address?: string;
}>(
    ({ address }) => {
        const openModal = client.modal.useOpenModal();
        const unclaimedOffers = client.live.myUnclaimedOffers();

        const [numClaims, setNumClaims] = React.useState(unclaimedOffers.length);
        const prevNumClaims = usePrevious(numClaims);

        React.useEffect(() => {
            if (unclaimedOffers.length !== prevNumClaims) setNumClaims(unclaimedOffers.length);
        }, [unclaimedOffers.length, prevNumClaims]);

        return (
            <Button
                className="mobile-pressable-div"
                buttonStyle={{
                    borderRadius: lib.layout.borderRadius.mediumish,
                    alignItems: 'center',
                    ...(address
                        ? {
                              opacity: 1,
                              pointerEvents: 'auto',
                              ...(numClaims === 0
                                  ? {
                                        background: lib.colors.transparentWhite,
                                        WebkitBackdropFilter: 'blur(50px)',
                                        backdropFilter: 'blur(50px)',
                                        color: lib.colors.primaryColor,
                                    }
                                  : { background: lib.colors.gradient2, color: lib.colors.white }),
                          }
                        : {
                              opacity: 0,
                              pointerEvents: 'none',
                          }),
                }}
                textStyle={{ ...lib.layout.presets.font.main.thicc, fontSize: 21 }}
                label="pending claims"
                leftIcon={
                    <div
                        style={{
                            position: 'relative',
                            justifyContent: 'center',
                            display: 'flex',
                            width: 20,
                            height: 20,
                            alignItems: 'center',
                            borderRadius: lib.layout.borderRadius.large,
                            background: lib.colors.transparentWhite,
                            ...lib.layout.presets.font.main.thicc,
                            color: lib.colors.primaryColor,
                            marginRight: 10,
                        }}
                    >
                        <span>{numClaims}</span>
                    </div>
                }
                onClick={() => {
                    openModal({ modalType: ModalEnum.Claim });
                }}
            />
        );
    },
    (a, b) => a.address === b.address,
);

export const NoFlashStatus = React.memo<{
    address?: string;
}>(
    () => {
        const openNuggbook = client.nuggbook.useGotoOpen();

        const health = client.health.useHealth();

        return (
            <Button
                className="mobile-pressable-div"
                buttonStyle={{
                    backgroundColor: health.graphProblem
                        ? lib.colors.transparentRed
                        : lib.colors.transparentWhite,
                    color: lib.colors.primaryColor,
                    borderRadius: lib.layout.borderRadius.mediumish,
                    WebkitBackdropFilter: 'blur(50px)',
                    backdropFilter: 'blur(50px)',
                    alignItems: 'center',
                }}
                textStyle={{ ...lib.layout.presets.font.main.thicc, fontSize: 21 }}
                label={health.graphProblem ? '📱 ⚠️' : '📲 🆗'}
                onClick={() => {
                    openNuggbook(Page.Status);
                }}
            />
        );
    },
    (a, b) => a.address === b.address,
);

export const NoFlash2 = React.memo<{
    address?: string;
    onClick: (full: boolean) => void;
}>(
    ({ address, onClick }) => {
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
                textStyle={{ ...lib.layout.presets.font.main.thicc, fontSize: 21 }}
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
                onClick={() => {
                    onClick(true);
                }}
            />
        );
    },
    (a, b) => a.address === b.address && a.onClick === b.onClick,
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
        // const ref = React.useRef<HTMLDivElement>(null)

        // useEffect(() => {
        //     // ref.current?.ontouchstart = (ev) => {
        //     //     ev.returnValue
        //     // }
        // }, [ref])
        return (
            <Button
                // ref={ref}
                rightIcon={
                    <div
                        className="concave"
                        style={{
                            height: 65,
                            width: 65,
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
                onClick={(ev) => {
                    ev.preventDefault();
                    onClick(isFull);
                }}
            />
        );
    },
    (a, b) => a.onClick === b.onClick && a.isFull === b.isFull,
);

export default NavigationBarMobile;
