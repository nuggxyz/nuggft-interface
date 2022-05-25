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

    const MOVE_DELAY = 800;
    const nuggbookPage = client.nuggbook.useNuggBookPage();
    const toggle = client.nuggbook.useToggle();

    const nuggbookOpen = React.useDeferredValue(client.nuggbook.useOpen());
    const isFull = React.useDeferredValue(isFullCore);
    const searchOpen = React.useDeferredValue(searchOpenCore);

    const [floaterA] = useSpring(
        {
            delay: isFull ? MOVE_DELAY + 200 : 0,
            justifyContent: isFull ? 'space-between' : 'flex-end',
            config: packages.spring.config.stiff,
        },
        [isFull],
    );

    const [floater] = useSpring(
        {
            width: isFull ? '100%' : '0%',
            delay: MOVE_DELAY,
            config: packages.spring.config.stiff,
        },
        [isFull],
    );

    const [floaterExit] = useSpring(
        {
            opacity: isFull ? 1 : 0,
            // ...(!isFull && { width: '0px' }),
            delay: MOVE_DELAY,
            config: packages.spring.config.stiff,
        },
        [isFull],
    );

    const [jazziconExit] = useSpring(
        {
            overflow: searchOpen || nuggbookOpen ? 'hidden' : 'auto',
            opacity: searchOpen || nuggbookOpen ? 0 : 1,
            pointerEvents: searchOpen || nuggbookOpen ? ('none' as const) : ('auto' as const),
            config: packages.spring.config.stiff,
        },
        [nuggbookOpen, searchOpen],
    );

    const [searchExit] = useSpring(
        {
            overflow: nuggbookOpen ? 'hidden' : 'auto',
            opacity: nuggbookOpen ? 0 : 1,
            pointerEvents: nuggbookOpen ? ('none' as const) : ('auto' as const),
            config: packages.spring.config.stiff,
        },
        [nuggbookOpen],
    );

    const [mainExit] = useSpring(
        {
            overflow: nuggbookOpen || searchOpen ? 'hidden' : 'auto',
            opacity: nuggbookOpen || searchOpen ? 0 : 1,
            pointerEvents: nuggbookOpen ? ('none' as const) : ('auto' as const),
            config: packages.spring.config.stiff,
        },
        [nuggbookOpen, searchOpen],
    );

    const [closeNuggbookEnter] = useSpring(
        {
            overflow: !nuggbookOpen ? 'hidden' : 'auto',
            opacity: !nuggbookOpen ? 0 : 1,
            pointerEvents: !nuggbookOpen ? ('none' as const) : ('auto' as const),
            config: packages.spring.config.stiff,
        },
        [nuggbookOpen],
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
                // paddingRight: 15,
                // paddingLeft: 15,
                pointerEvents: 'none',
            }}
            // onClick={(event) => {
            //     // event.preventDefault();
            //     event.persist();
            // }}
        >
            {/* <div style={{position: 'absolute', }}></div> */}
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
                    // pointerEvents: 'painted',
                    // paddingRight: 10,
                    borderRadius: lib.layout.borderRadius.medium,
                    background: lib.colors.transparentWhite,
                    boxShadow: lib.layout.boxShadow.dark,
                    ...floater,
                    ...floaterA,
                }}
            >
                {/* ////////////////////////////////////////////////////////////////////////
                    search bar
                //////////////////////////////////////////////////////////////////////// */}
                <animated.div
                    className={isFull && !searchOpen ? 'mobile-pressable-div' : undefined}
                    style={{
                        zIndex: 5,

                        position: 'relative',
                        display: 'flex',
                        width: '75px',
                        height: '75px',
                        justifyContent: 'flex-start',
                        // ...(!isFull ? { width: '0%', overflow: 'hidden' } : {}),
                        ...searchExit,
                        // ...(nuggbookOpen ? { height: '75px' } : {}),

                        ...(searchOpen
                            ? { width: '100%', position: 'absolute', height: '100%' }
                            : {}),
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
                        zIndex: 5,
                        ...floaterExit,
                        // ...(!isFull || searchOpen
                        //     ? { overflow: 'hidden', opacity: 0, pointerEvents: 'none' }
                        //     : {}),
                        height: '75px',
                        position: 'relative',
                    }}
                >
                    <animated.div
                        style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                            ...mainExit,
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

                <animated.div
                    id="hi-there-bob"
                    style={{
                        ...closeNuggbookEnter,
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
                    }}
                >
                    <Button
                        className="mobile-pressable-div"
                        buttonStyle={{
                            zIndex: 6,
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
                            zIndex: 6,
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
                    jazzicon
                //////////////////////////////////////////////////////////////////////// */}
                <animated.div
                    className={isFull && !searchOpen ? 'mobile-pressable-div' : undefined}
                    style={{
                        zIndex: 5,
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 12,
                        borderRadius: lib.layout.borderRadius.medium,
                        justifySelf: 'center',
                        ...jazziconExit,
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
                        // ...floaterExit,
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
