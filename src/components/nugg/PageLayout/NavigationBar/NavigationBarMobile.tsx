import React, { FC } from 'react';
import { animated } from '@react-spring/web';
import { useMatch, useNavigate } from 'react-router-dom';
import { IoQrCode } from 'react-icons/io5';

import NuggDexSearchBar from '@src/components/nugg/NuggDex/NuggDexSearchBar/NuggDexSearchBar';
import useDimentions from '@src/client/hooks/useDimentions';
import { Page } from '@src/interfaces/nuggbook';
import InfoClicker from '@src/components/nuggbook/InfoClicker';
import lib from '@src/lib';
import web3 from '@src/web3';
import IconButton from '@src/components/general/Buttons/IconButton/IconButton';
import Jazzicon from '@src/components/nugg/Jazzicon';
import HealthIndicator from '@src/components/general/Buttons/HealthIndicator/HealthIndicator';
import NLStaticImage from '@src/components/general/NLStaticImage';

import styles from './NavigationBar.styles';

type Props = {
    showBackButton?: boolean;
};

const NavigationBarMobile: FC<Props> = () => {
    const { screen: screenType } = useDimentions();

    const navigate = useNavigate();

    const address = web3.hook.usePriorityAccount();

    const isViewOpen = useMatch('/view/*');

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
                    height: 50,

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
                        ...(isViewOpen && screenType === 'phone'
                            ? { width: '100%', position: 'absolute' }
                            : {}),
                    }}
                >
                    <NuggDexSearchBar />
                </div>

                {!isViewOpen && (
                    <div
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
                            size={30}
                            color={lib.colors.nuggBlueSemiTransparent}
                            buttonStyle={{ padding: 0 }}
                            // iconDropShadow={lib.layout.boxShadow.medium}
                        />
                    </div>
                )}

                {
                    !isViewOpen ? (
                        <div
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
                                        <Jazzicon address={address || ''} size={35} />
                                    ) : (
                                        <IoQrCode
                                            style={{ color: lib.colors.nuggBlueSemiTransparent }}
                                            size={35}
                                        />
                                    )
                                }
                            />
                        </div>
                    ) : null
                    // <Button
                    //     label="back"
                    //     onClick={() => navigate(-1)}
                    //     buttonStyle={{
                    //         right: 30,
                    //         position: 'absolute',
                    //     }}
                    // />
                }
            </div>
        </animated.div>
    );
};

export default React.memo(NavigationBarMobile);
