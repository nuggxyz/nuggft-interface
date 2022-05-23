import React, { FC } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useNavigate } from 'react-router-dom';
import { IoQrCode } from 'react-icons/io5';

import { Page } from '@src/interfaces/nuggbook';
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

    // const [floaterExit12] = useSpring(
    //     {
    //         // width: isFull && !searchOpen ? undefined : 0,
    //         opacity: isFull && !searchOpen ? 1 : 0,
    //     },
    //     [isFull, searchOpen],
    // );

    // emitter.hook.useOn({
    //     type: emitter.events.RouteChange,
    //     callback: React.useCallback(
    //         (dat) => {
    //             setSearchOpen(false);
    //             setManualMatch(false);
    //         },
    //         [setSearchOpen, setManualMatch],
    //     ),
    // });

    const [searchOpenUp] = useSpring(
        {
            height: searchOpen ? '450px' : '75px',
            config: packages.spring.config.stiff,
        },
        [searchOpen],
    );

    const ref = React.useRef(null);

    useOnClickOutside(ref, () => {
        setSearchOpen(false);
        setManualMatch(false);
    });

    console.log({ searchOpen, isFull });

    return (
        <div
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
                paddingRight: 15,
                paddingLeft: 15,
                pointerEvents: 'none',
            }}
            // onClick={(event) => {
            //     // event.preventDefault();
            //     event.persist();
            // }}
        >
            <animated.div
                className={!isFull ? 'mobile-pressable-div' : undefined}
                style={{
                    display: 'flex',
                    alignItems: searchOpen ? 'flex-start' : 'center',
                    WebkitBackdropFilter: 'blur(50px)',
                    backdropFilter: 'blur(50px)',
                    minWidth: '75px',
                    // pointerEvents: 'painted',

                    ...searchOpenUp,
                    // paddingRight: 10,
                    paddingLeft: 10,
                    borderRadius: lib.layout.borderRadius.medium,
                    background: lib.colors.transparentWhite,
                    boxShadow: lib.layout.boxShadow.medium,
                    ...floater,
                    ...floaterA,
                }}
            >
                <animated.div
                    className={isFull && !searchOpen ? 'mobile-pressable-div' : undefined}
                    style={{
                        position: 'relative',
                        display: 'flex',
                        width: '75px',
                        height: '100%',
                        justifyContent: 'flex-start',
                        // ...(!isFull ? { width: '0%', overflow: 'hidden' } : {}),
                        ...floaterExit,
                        ...(searchOpen ? { width: '100%', position: 'absolute' } : {}),
                    }}
                >
                    <NuggDexSearchBarMobile
                        openable={isFull}
                        setOpen={setSearchOpen}
                        open={searchOpen}
                    />
                </animated.div>

                <animated.div
                    style={{
                        // ...abc,
                        // display: searchOpen ? 'none' : 'flex',
                        // width: 100,
                        // ...(!isFull || searchOpen ? { width: 0 } : {}),

                        ...floaterExit,
                        // ...(!isFull && { position: 'absolute' }),
                        ...(!isFull || searchOpen ? { overflow: 'hidden' } : {}),
                        ...(searchOpen && { width: 0 }),
                        // opacity: isFull && !searchOpen ? 1 : 0,
                        // ...(searchOpen && { width: 0 }),
                        // padding: '0rem 1rem',
                    }}
                >
                    <animated.div
                        style={{
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
                            to={Page.TableOfContents}
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
                        pointerEvents: 'auto',

                        justifySelf: 'center',
                        // justifyContent: 'flex-end',
                        zIndex: 10000000000,
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
            </animated.div>
        </div>
    );
};

const NoFlash = React.memo<{ address?: string; isFull: boolean; onClick: (full: boolean) => void }>(
    ({ address, onClick, isFull }) => {
        return (
            <Button
                rightIcon={
                    address ? (
                        <Jazzicon address={address || ''} size={50} />
                    ) : (
                        <IoQrCode
                            style={{
                                color: lib.colors.semiTransparentPrimaryColor,
                            }}
                            size={50}
                        />
                    )
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
