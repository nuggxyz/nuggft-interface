import React, { FC } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useNavigate } from 'react-router-dom';
import { IoQrCode } from 'react-icons/io5';

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

type Props = {
    showBackButton?: boolean;
};

const NavigationBarMobile: FC<Props> = () => {
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
                        ...floaterExit,
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

                {/* {nuggbookOpen && (
                    <Button
                        className="mobile-pressable-div"
                        size="small"
                        buttonStyle={{
                            // position: 'absolute',
                            // left: 3,
                            // bottom: -50,
                            borderRadius: lib.layout.borderRadius.mediumish,
                            background: lib.colors.transparentWhite,
                            WebkitBackdropFilter: 'blur(30px)',
                            backdropFilter: 'blur(30px)',
                            boxShadow: lib.layout.boxShadow.basic,
                        }}
                        leftIcon={
                            <IoChevronDownCircle
                                size={24}
                                color={lib.colors.primaryColor}
                                style={{
                                    marginRight: 5,
                                    marginLeft: -5,
                                }}
                            />
                        }
                        textStyle={{
                            color: lib.colors.primaryColor,
                            fontSize: 18,
                        }}
                        label="go back"
                        onClick={() => nuggbookClose()}
                    />
                )} */}

                <animated.div
                    style={{
                        zIndex: 5,
                        // display: searchOpen ? 'none' : 'flex',
                        // width: 100,
                        // ...(!isFull || searchOpen ? { width: 0 } : {}),

                        ...floaterExit,
                        // ...(!isFull && { position: 'absolute' }),
                        ...(!isFull || searchOpen
                            ? { overflow: 'hidden', opacity: 0, pointerEvents: 'none' }
                            : {}),
                        // ...(searchOpen && { width: 0 }),
                        // opacity: isFull && !searchOpen ? 1 : 0,
                        // ...(searchOpen && { width: 0 }),
                        // padding: '0rem 1rem',
                        height: '75px',
                    }}
                >
                    <animated.div
                        style={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-around',
                            alignItems: 'center',
                        }}
                    >
                        {/* <div style={{ marginRight: '10px' }}> */}
                        <HealthIndicator />
                        {/* </div> */}
                        <NLStaticImage image="nuggbutton" />
                        <InfoClicker
                            // to={Page.TableOfContents}
                            size={45}
                            color={lib.colors.nuggBlueSemiTransparent}
                            buttonStyle={{ padding: 0 }}
                            // iconDropShadow={lib.layout.boxShadow.medium}
                        />
                    </animated.div>
                </animated.div>

                <div
                    className={isFull && !searchOpen ? 'mobile-pressable-div' : undefined}
                    style={{
                        zIndex: 5,
                        ...(searchOpen
                            ? { opacity: 0, pointerEvents: 'none' }
                            : { pointerEvents: 'auto' }),

                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        // background: isFull ? 'transparent' : lib.colors.transparentWhite,
                        padding: 12,
                        borderRadius: lib.layout.borderRadius.medium,
                        // width: searchOpen ? 0 : '50%',
                        // opacity: searchOpen ? 0 : 1,
                        // WebkitBackdropFilter: 'blur(30px)',
                        // backdropFilter: 'blur(30px)',

                        justifySelf: 'center',
                        // justifyContent: 'flex-end',
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
                </div>
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
                        WebkitMaskImage: 'linear-gradient(180deg, #000 70%, transparent)',
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
                        {/* <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                right: 0,
                                left: 0,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                // background: 'white',
                                // borderRadius: '50%',
                                // transform:
                                //     'translateX(68px) translateY(-60px) skewX(15deg) skewY(2deg)',
                            }}
                        >
                            <div
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '3px',
                                    border: '3px solid white',
                                }}
                            />
                        </div> */}
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
