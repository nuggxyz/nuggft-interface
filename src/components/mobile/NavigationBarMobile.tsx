import React, { CSSProperties, FC } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { IoInformationCircle, IoQrCode, IoSearch } from 'react-icons/io5';
import { useMatch, useNavigate } from 'react-router';

import lib from '@src/lib';
import web3 from '@src/web3';
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
import clicker from '@src/assets/images/nugg/clicker2.svg';
import emitter from '@src/emitter';

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

    const [manualMatch, setManualMatch] = React.useState<boolean>(false);

    const close = client.nuggbook.useCloseNuggBook();
    const nuggbookGoto = client.nuggbook.useGotoOpen();

    const setCurrencyPreference = client.usd.useSetCurrencyPreferrence();
    const currencyPreferrence = client.usd.useCurrencyPreferrence();
    const matchHomeCore = useMatch('/');
    const matchHome = React.useDeferredValue(matchHomeCore);
    const nuggbookOpen = React.useDeferredValue(client.nuggbook.useOpen());
    const nuggbookPage = React.useDeferredValue(client.nuggbook.useNuggBookPage());

    const isFull = React.useDeferredValue(manualMatch);

    const prevNuggbookOpen = usePrevious(nuggbookOpen);

    React.useEffect(() => {
        if (prevNuggbookOpen !== nuggbookOpen && nuggbookOpen && !manualMatch) {
            setManualMatch(true);
        }
    }, [manualMatch, nuggbookOpen, prevNuggbookOpen]);

    const [floater] = useSpring(
        {
            width: isFull ? '100%' : '0%',
            config: packages.spring.config.stiff,
        },
        [isFull],
    );

    emitter.hook.useOn({
        type: emitter.events.RequestCloseMobileNavbar,
        callback: () => {
            close();
            setManualMatch(false);
        },
    });

    /* ////////////////////////////////////////////////////////////////////////
       search
    //////////////////////////////////////////////////////////////////////// */

    const [opacitate, opacitateAnimated] = useOpacitate(
        'mobile-nav',
        React.useMemo(() => isFull && !nuggbookOpen, [isFull, nuggbookOpen]),
    );

    const [nuggbookOpenUp] = useSpring(
        {
            height: nuggbookOpen
                ? nuggbookPage === Page.Start
                    ? '250px'
                    : '600px'
                : isFull
                ? '200px'
                : '75px',

            config: packages.spring.config.stiff,
        },
        [nuggbookOpen, nuggbookPage, isFull],
    );

    const [nuggbookFade] = useSpring(
        {
            opacity: nuggbookOpen ? 1 : 0,
            config: packages.spring.config.stiff,
        },
        [nuggbookOpen],
    );

    const ref = React.useRef(null);

    const prevMatchHomeCore = usePrevious(matchHomeCore);

    const [, startTransition] = React.useTransition();

    const tapper = React.useCallback(() => {
        startTransition(() => {
            if (nuggbookOpen) close();
            // purposfully last - dont want to fully close the square if something is open
            else if (manualMatch && matchHomeCore === prevMatchHomeCore) {
                setTimeout(() => {
                    setManualMatch(false);
                }, 1000);
            }
        });
    }, [manualMatch, nuggbookOpen, close, matchHomeCore, prevMatchHomeCore]);

    useOnTapOutside(ref, tapper);

    const homeClick = React.useCallback(() => {
        if (nuggbookOpen) {
            close();
        } else if (!manualMatch) {
            setManualMatch(true);
        }
        // eslint-disable-next-line no-useless-return
        else if (matchHome) {
            setManualMatch(false);
        } else {
            navigate('/');
        }
    }, [manualMatch, close, navigate, matchHome, nuggbookOpen]);

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
            onClick={(ev) => {
                ev.preventDefault();
                ev.stopPropagation();
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
                    // height: isFull ? '200px' : '75px',
                    marginRight: 15,
                    marginLeft: 15,
                    ...nuggbookOpenUp,
                    position: 'relative',
                    borderRadius: lib.layout.borderRadius.mediumishish,
                    background: lib.colors.transparentWhite,
                    boxShadow: lib.layout.boxShadow.dark,
                    // overflow: 'hidden',
                    ...floater,
                }}
                onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
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
                            // width: '200px',
                            margin: 'none',
                            display: 'flex',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                        }}
                    >
                        {/* <Button
                            buttonStyle={{
                                padding: 0,
                                background: 'transparent',
                            }}
                            rightIcon={<span>💬</span>}
                            onClick={() => nuggbookGoto(Page.Feedback)}
                        /> */}
                        {/* {matchHome ? ( */}
                        <div
                            style={{
                                // display: 'flex',
                                // justifyContent: 'center',
                                // alignItems: 'center',
                                position: 'relative',
                                borderRadius: lib.layout.borderRadius.large,
                                // boxShadow: lib.layout.boxShadow.dark,
                                padding: '.2rem .7rem .5rem',
                                textAlign: 'center',
                                verticalAlign: 'center',
                                // marginBottom: '.4rem',
                                background: lib.colors.gradient2Transparent,
                                WebkitBackdropFilter: 'blur(50px)',
                                backdropFilter: 'blur(50px)',
                                marginLeft: -8,
                                // marginBottom: -5,
                                // background: lib.colors.gradient2,
                            }}
                            role="button"
                            aria-hidden="true"
                            onClick={() => {
                                navigate('/');
                            }}
                        >
                            <span
                                style={{
                                    fontSize: '30px',
                                    color: 'white',
                                    // WebkitBackgroundClip: 'text',
                                    // WebkitTextFillColor: 'transparent',

                                    ...lib.layout.presets.font.main.thicc,
                                }}
                            >
                                nugg.xyz
                            </span>
                        </div>
                    </animated.div>
                </animated.div>

                {/* ////////////////////////////////////////////////////////////////////////
                    home
                //////////////////////////////////////////////////////////////////////// */}
                <animated.div
                    style={{
                        zIndex: 100000000,
                        position: 'absolute',
                        right: 0,
                        display: 'flex',
                        alignItems: 'center',
                        // padding: 12,
                        height: '75px',
                        width: '75px',
                        borderRadius: lib.layout.borderRadius.medium,
                        justifySelf: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'auto',
                    }}
                >
                    <div
                        style={{
                            minWidth: '85px',
                            height: '85px',
                            background: lib.colors.transparentWhite,
                            borderRadius: '22.5%',
                            WebkitTapHighlightColor: 'transparent',
                            boxShadow: '0 6px 10px rgba(102, 102, 102, 0.4)',
                            display: 'flex',
                            WebkitBackdropFilter: 'blur(50px)',
                            backdropFilter: 'blur(50px)',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <HomeButton onClick={homeClick} isFull={isFull} />
                    </div>
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
                    claim button
                //////////////////////////////////////////////////////////////////////// */}
            <animated.div
                style={{
                    zIndex: 10,
                    position: 'absolute',
                    left: 15,
                    top: -45,
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
                    left: 25,
                    top: 10,
                    display: 'flex',
                    alignItems: 'flex-start',
                    flexDirection: 'column',
                    // borderRadius: lib.layout.borderRadius.medium,
                    justifySelf: 'center',
                    ...opacitate,
                }}
            >
                <Account
                    address={address}
                    onClick={React.useCallback(() => {
                        // if (address) navigate('/wallet');
                        nuggbookGoto(Page.Connect);
                    }, [nuggbookGoto])}
                />
                <div style={{ marginTop: '10px' }} />
                <Learn
                    onClick={React.useCallback(() => {
                        // if (address) navigate('/wallet');
                        nuggbookGoto(Page.TableOfContents);
                    }, [nuggbookGoto])}
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
                    right: 25,
                    top: 15,
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
                    containerStyle={
                        {
                            // background: lib.colors.transparentWhite,
                            // borderRadius: lib.layout.borderRadius.mediumish,
                            // WebkitBackdropFilter: 'blur(30px)',
                            // backdropFilter: 'blur(30px)',
                            // height: '50px',
                            // // this padding is required because the width needs to be 90 for the "DualToggler"
                            // width: '100px',
                            // padding: '5px',
                        }
                    }
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
                    right: 25,
                    top: 60,
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: lib.layout.borderRadius.medium,
                    justifySelf: 'center',
                    ...opacitate,
                }}
            >
                <NoFlashStatus address={address} />
            </div>
        </animated.div>
    );
};

export const NoFlashClaims = React.memo<{
    address?: string;
}>(
    ({ address }) => {
        const openModal = client.modal.useOpenModal();
        const unclaimedOffers = client.live.myUnclaimedOffers();
        const epoch = client.epoch.active.useId();
        const [numClaims, setNumClaims] = React.useState(unclaimedOffers.length);
        const prevNumClaims = usePrevious(numClaims);

        React.useEffect(() => {
            if (epoch) {
                const now = unclaimedOffers.filter(
                    (x) => (x?.endingEpoch || 10000000) < epoch,
                ).length;
                if (now !== prevNumClaims) setNumClaims(now);
            }
        }, [unclaimedOffers, prevNumClaims, epoch]);

        return numClaims !== 0 ? (
            <Button
                className="mobile-pressable-div"
                buttonStyle={{
                    borderRadius: lib.layout.borderRadius.mediumish,
                    alignItems: 'center',
                    ...(address
                        ? {
                              opacity: 1,
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
        ) : null;
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
                    width: '90px',
                    WebkitTapHighlightColor: 'transparent',
                    boxShadow: '0 6px 10px rgba(102, 102, 102, 0.4)',
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

export const Account = React.memo<{
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
                    boxShadow: lib.layout.boxShadow.dark,
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

export const Learn = React.memo<{
    onClick: (full: boolean) => void;
}>(
    ({ onClick }) => {
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
                    boxShadow: lib.layout.boxShadow.dark,
                }}
                textStyle={{ ...lib.layout.presets.font.main.thicc, fontSize: 21 }}
                label="learn"
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
                        <IoInformationCircle
                            size={25}
                            color={lib.colors.nuggBlueSemiTransparent}
                            className="info-clicker"
                            style={{
                                background: 'transparent',
                                pointerEvents: 'auto',
                            }}
                        />
                    </div>
                }
                onClick={() => {
                    onClick(true);
                }}
            />
        );
    },
    (a, b) => a.onClick === b.onClick,
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
                className="home-button"
                rightIcon={
                    <img
                        alt="nugg clicker"
                        src={clicker}
                        height={55}
                        style={{
                            borderRadius: lib.layout.borderRadius.large,
                            objectFit: 'cover',
                            pointerEvents: 'none',
                        }}
                    />
                }
                buttonStyle={{
                    zIndex: 100000000,

                    width: '90%',
                    height: '90%',
                    justifyContent: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    padding: 10,
                    background: lib.colors.gradient3,
                    borderRadius: '22.5%',
                    WebkitTapHighlightColor: 'transparent',
                }}
                onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    onClick(isFull);
                }}
            />
        );
    },
    (a, b) => a.onClick === b.onClick && a.isFull === b.isFull,
);

export default NavigationBarMobile;
/* <div
style={{
    // display: 'flex',
    // justifyContent: 'center',
    // alignItems: 'center',
    position: 'relative',
    borderRadius: lib.layout.borderRadius.large,
    boxShadow: lib.layout.boxShadow.dark,
    padding: '.4rem 1rem .8rem',
    textAlign: 'center',
    verticalAlign: 'center',
    marginBottom: '.4rem',
    backgroundColor: lib.colors.transparentWhite,
    WebkitBackdropFilter: 'blur(50px)',
    backdropFilter: 'blur(50px)',
}}
>
<span
    style={{
        fontSize: '30px',
        background: lib.colors.gradient2,
        color: 'black',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',

        ...lib.layout.presets.font.main.thicc,
    }}
>
    welcome to nuggft
</span>
</div> */
// ) : (
//     <div
//         style={{
//             display: 'flex',
//             width: '100%',
//             justifyContent: 'flex-start',
//         }}
//     >
//         <IconButton
//             aria-hidden="true"
//             buttonStyle={{
//                 padding: 0,
//                 height: 75,
//                 width: 75,
//                 background: 'transparent',
//                 borderRadius: lib.layout.borderRadius.large,
//                 marginRight: 5,
//                 marginLeft: -5,
//             }}
//             onClick={() => {
//                 navigate('/');
//             }}
//             iconComponent={
//                 <IoChevronBack
//                     style={{
//                         color: lib.colors.semiTransparentPrimaryColor,
//                     }}
//                     size={50}
//                 />
//             }
//         />
//         <IconButton
//             aria-hidden="true"
//             buttonStyle={{
//                 padding: 0,
//                 height: 75,
//                 width: 75,
//                 background: 'transparent',
//                 borderRadius: lib.layout.borderRadius.large,
//             }}
//             onClick={() => {
//                 navigate(-1);
//             }}
//             iconComponent={
//                 <IoHome
//                     style={{
//                         color: lib.colors.semiTransparentPrimaryColor,
//                     }}
//                     size={50}
//                 />
//             }
//         />
//     </div>
// )}
