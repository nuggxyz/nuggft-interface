import React, { FC } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useNavigate } from 'react-router-dom';
import { IoQrCode } from 'react-icons/io5';
import { IoIosCloseCircle, IoIosMenu } from 'react-icons/io';

import InfoClicker from '@src/components/nuggbook/InfoClicker';
import lib from '@src/lib';
import web3 from '@src/web3';
import Jazzicon from '@src/components/nugg/Jazzicon';
import NLStaticImage from '@src/components/general/NLStaticImage';
import NuggDexSearchBarMobile from '@src/components/mobile/NuggDexSearchBarMobile';
import HealthIndicator from '@src/components/general/Buttons/HealthIndicator/HealthIndicator';
import { useMatchArray } from '@src/hooks/useBlur';
import Button from '@src/components/general/Buttons/Button/Button';
import useOnClickOutside from '@src/hooks/useOnClickOutside';
import packages from '@src/packages';
import client from '@src/client';
import PageWrapper2 from '@src/components/nuggbook/PageWrapper2';
import { Page } from '@src/interfaces/nuggbook';

// const useOpacitate = <Props extends UseSpringProps>(
//     arg: boolean | undefined,
//     props?: Props,
//     extraDeps?: DependencyList,
// ) => {
//     const [check] = useSpring<Props>(
//         {
//             opacity: arg ? 1 : 0,
//             pointerEvents: arg ? 'none' : 'auto',
//             ...props,
//         },
//         [arg, ...(extraDeps ?? [])],
//     );

//     return check;
// };

const NavigationBarMobile: FC<unknown> = () => {
    const navigate = useNavigate();

    const address = web3.hook.usePriorityAccount();

    const [searchOpenCore, setSearchOpen] = React.useState<boolean>(false);

    const [manualMatch, setManualMatch] = React.useState<boolean>(false);

    const match = useMatchArray(['/swap/:id', '/live']);

    const isFullCore = React.useMemo(() => {
        return match || manualMatch;
    }, [match, manualMatch]);

    React.useEffect(() => {
        setManualMatch(false);
        setSearchOpen(false);
    }, [match]);

    // const MOVE_DELAY = 800;
    const nuggbookPage = client.nuggbook.useNuggBookPage();
    const toggle = client.nuggbook.useToggle();

    const nuggbookOpen = React.useDeferredValue(client.nuggbook.useOpen());
    const isFull = React.useDeferredValue(isFullCore);
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

    const [searchExit, searchExitToAnimate] = React.useMemo(() => {
        const opacity = isFull && !nuggbookOpen ? 1 : 0;

        const pointerEvents = opacity === 0 ? ('all' as const) : ('auto' as const);

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
    }, [nuggbookOpen, isFull]);

    const [searchExitAnimated] = useSpring(() => {
        return {
            ...searchExitToAnimate,
            config: packages.spring.config.stiff,
        };
    }, [searchExitToAnimate]);

    /* ////////////////////////////////////////////////////////////////////////
       middle
    //////////////////////////////////////////////////////////////////////// */

    const [middleExit, middleExitToAnimate] = React.useMemo(() => {
        const opacity = isFull && !nuggbookOpen && !searchOpen ? 1 : 0;

        const pointerEvents = opacity === 0 ? ('all' as const) : ('auto' as const);

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
    }, [isFull, searchOpen, nuggbookOpen]);

    const [middleExitAnimated] = useSpring(() => {
        return {
            ...middleExitToAnimate,
            config: packages.spring.config.stiff,
        };
    }, [middleExitToAnimate]);

    /* ////////////////////////////////////////////////////////////////////////
       close
    //////////////////////////////////////////////////////////////////////// */

    const [closeExit, closeExitToAnimate] = React.useMemo(() => {
        const opacity = nuggbookOpen ? 1 : 0;

        const pointerEvents = opacity === 0 ? ('all' as const) : ('auto' as const);

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
    }, [nuggbookOpen]);

    const [closeExitAnimated] = useSpring(() => {
        return {
            ...closeExitToAnimate,
            config: packages.spring.config.stiff,
        };
    }, [closeExitToAnimate]);

    /* ////////////////////////////////////////////////////////////////////////
       jazz
    //////////////////////////////////////////////////////////////////////// */

    const [jazzExit, jazzExitToAnimate] = React.useMemo(() => {
        const opacity = !searchOpen && !nuggbookOpen ? 1 : 0;

        const pointerEvents = opacity === 0 ? ('all' as const) : ('auto' as const);

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
    }, [nuggbookOpen, searchOpen]);

    const [jazzExitAnimated] = useSpring(() => {
        return {
            ...jazzExitToAnimate,
            config: packages.spring.config.stiff,
        };
    }, [jazzExitToAnimate]);

    // const [searchExit] = useSpring(
    //     {
    //         overflow: nuggbookOpen ? 'hidden' : 'auto',
    //         opacity: nuggbookOpen ? 0 : 1,
    //         width: isFull ? '75px' : '0px',
    //         // delay: MOVE_DELAY + 200,
    //         pointerEvents: nuggbookOpen ? ('all' as const) : ('auto' as const),
    //         config: packages.spring.config.stiff,
    //     },
    //     [nuggbookOpen, isFull],
    // );

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

    useOnClickOutside(ref, () => {
        setSearchOpen(false);
        setManualMatch(false);
    });

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
                className={!isFull ? 'mobile-pressable-div' : undefined}
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
                    ...floater,
                }}
            >
                {/* ////////////////////////////////////////////////////////////////////////
                    search bar
                //////////////////////////////////////////////////////////////////////// */}
                <animated.div
                    className={isFull && !searchOpen ? 'mobile-pressable-div' : undefined}
                    style={{
                        zIndex: 8,
                        display: 'flex',
                        justifyContent: 'flex-start',
                        position: 'absolute',
                        ...(searchOpen ? { width: '100%', height: '100%' } : { left: 0 }),
                        ...searchExit,
                        ...searchExitAnimated,
                    }}
                >
                    <NuggDexSearchBarMobile
                        openable={isFull}
                        setOpen={setSearchOpen}
                        open={searchOpen}
                    />
                </animated.div>

                {/* ////////////////////////////////////////////////////////////////////////
                    middle 3 icons
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
                        ...middleExit,
                        ...middleExitAnimated,
                    }}
                >
                    <animated.div
                        style={{
                            height: '100%',
                            width: '200px',
                            margin: 'none',
                            // width: '100%',
                            display: 'flex',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                            // ...middleExit,
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
                        padding: 10,
                        zIndex: 8,
                        ...closeExit,
                        ...closeExitAnimated,
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
                        onClick={() => toggle()}
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
                        onClick={() => toggle()}
                    />
                </animated.div>

                {/* ////////////////////////////////////////////////////////////////////////
                    jazz
                //////////////////////////////////////////////////////////////////////// */}
                <animated.div
                    className="mobile-pressable-div"
                    style={{
                        zIndex: 8,
                        position: 'absolute',
                        right: 0,
                        display: 'flex',
                        alignItems: 'center',
                        padding: 12,
                        borderRadius: lib.layout.borderRadius.medium,
                        justifySelf: 'center',
                        ...jazzExit,
                        ...jazzExitAnimated,
                    }}
                >
                    <NoFlash
                        address={address}
                        onClick={(full: boolean) => {
                            if (full) navigate('/wallet');
                            else {
                                navigate('/');
                            }
                        }}
                        isFull={isFull}
                    />
                </animated.div>

                {/* ////////////////////////////////////////////////////////////////////////
                    the nuggbook
                //////////////////////////////////////////////////////////////////////// */}
                <animated.div
                    // className={isFull && !searchOpen ? 'mobile-pressable-div' : undefined}
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
                        // ...(!isFull ? { width: '0%', overflow: 'hidden' } : {}),
                        // ...middleExit,
                        WebkitMaskImage: 'linear-gradient(180deg, #000 90%, transparent)',
                        ...nuggbookFade,
                        // ...(nuggbookOpen ? { width: '100%' } : { width: '100%' }),
                    }}
                >
                    <PageWrapper2 />
                </animated.div>
            </animated.div>
        </animated.div>
    );
};

const NoFlash = React.memo<{ address?: string; isFull: boolean; onClick: (full: boolean) => void }>(
    ({ address, onClick, isFull }) => {
        return (
            <Button
                rightIcon={
                    <div style={{ position: 'relative' }}>
                        <div>
                            {address ? (
                                <Jazzicon address={address || ''} size={50} className="concave" />
                            ) : (
                                <IoQrCode
                                    style={{
                                        color: lib.colors.semiTransparentPrimaryColor,
                                    }}
                                    size={50}
                                />
                            )}
                        </div>
                    </div>
                }
                buttonStyle={{
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

export default NavigationBarMobile;
