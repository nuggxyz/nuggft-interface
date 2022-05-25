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
    const close = client.nuggbook.useCloseNuggBook();

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

    const closeOpacitate = useOpacitate(React.useMemo(() => nuggbookOpen, [nuggbookOpen]));

    /* ////////////////////////////////////////////////////////////////////////
       jazz
    //////////////////////////////////////////////////////////////////////// */

    const jazzOpacitate = useOpacitate(
        React.useMemo(() => !searchOpen && !nuggbookOpen, [nuggbookOpen, searchOpen]),
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
                        ...jazzOpacitate,
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
