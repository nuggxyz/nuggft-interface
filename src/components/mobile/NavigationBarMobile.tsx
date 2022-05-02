import React, { FC } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useNavigate } from 'react-router-dom';
import { IoQrCode } from 'react-icons/io5';

import { Page } from '@src/interfaces/nuggbook';
import InfoClicker from '@src/components/nuggbook/InfoClicker';
import lib from '@src/lib';
import web3 from '@src/web3';
import IconButton from '@src/components/general/Buttons/IconButton/IconButton';
import Jazzicon from '@src/components/nugg/Jazzicon';
import HealthIndicator from '@src/components/general/Buttons/HealthIndicator/HealthIndicator';
import NLStaticImage from '@src/components/general/NLStaticImage';
import NuggDexSearchBarMobile from '@src/components/mobile/NuggDexSearchBarMobile';
import styles from '@src/components/nugg/PageLayout/NavigationBar/NavigationBar.styles';

type Props = {
    showBackButton?: boolean;
};

const NavigationBarMobile: FC<Props> = () => {
    const navigate = useNavigate();

    const address = web3.hook.usePriorityAccount();

    const [searchOpen, setSearchOpen] = React.useState<boolean>(false);

    const abc = useSpring({
        opacity: searchOpen ? 0 : 1,
        height: searchOpen ? 0 : 1,
    });

    return (
        <animated.div
            style={{
                display: 'flex',
                position: 'absolute',
                top: 0,
                width: '100%',
                zIndex: 1000,
                alignItems: 'center',
                justifyContent: 'center',
                transition: `all 0.3s ${lib.layout.animation}`,
                marginTop: 10,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    width: '93%',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    WebkitBackdropFilter: 'blur(20px)',
                    height: '75px',

                    borderRadius: lib.layout.borderRadius.medium,
                    background: lib.colors.transparentWhite,
                    boxShadow: lib.layout.boxShadow.medium,
                }}
            >
                <div
                    style={{
                        padding: '0rem .5rem',
                        position: 'relative',
                        display: 'flex',
                        width: '50%',
                        justifyContent: 'flex-start',
                        pointerEvents: 'none',
                        ...(searchOpen ? { width: '100%', position: 'absolute' } : {}),
                    }}
                >
                    <NuggDexSearchBarMobile setOpen={setSearchOpen} open={searchOpen} />
                </div>

                <animated.div style={{ ...abc, display: searchOpen ? 'none' : 'flex' }}>
                    {!searchOpen && (
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
                    )}

                    {!searchOpen ? (
                        <animated.div
                            style={{
                                ...styles.linkAccountContainer,
                                padding: '0rem .5rem',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                            }}
                        >
                            <IconButton
                                aria-hidden="true"
                                buttonStyle={{
                                    padding: 0,
                                    background: 'transparent',
                                    borderRadius: lib.layout.borderRadius.large,
                                    // boxShadow: lib.layout.boxShadow.medium,
                                }}
                                onClick={() => {
                                    navigate('/wallet');
                                }}
                                iconComponent={
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
                            />
                        </animated.div>
                    ) : null}
                </animated.div>
            </div>
        </animated.div>
    );
};

export default React.memo(NavigationBarMobile);
