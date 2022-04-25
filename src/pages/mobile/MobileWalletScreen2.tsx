/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';

import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import MobileWallet from '@src/components/mobile/MobileWallet';

// this makes the MobileViewScreen behave like a regular component
// MobileViewScreen is always rendered, just hidden and this triggers it

const MobileViewScreen2: FC<PropsWithChildren<{ onClose?: () => void }>> = () => {
    const [, startTransiton] = React.useTransition();

    const navigate = useNavigate();

    const node = React.useRef<HTMLDivElement>(null);

    const [death, setDeath] = React.useState(false);

    return !death || death ? (
        <>
            <div
                style={{
                    // transition: 'all .3s ease-in',
                    animation: 'mobile-fade .3s ease-out',
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: 'transparent',
                    // background: lib.colors.transparentDarkGrey2,
                    backdropFilter: 'blur(10px)',
                    // @danny7even this seemed to cause problems with issue #67 - but it didnt solve any
                    WebkitBackdropFilter: 'blur(10px)',
                    overflow: 'hidden',

                    flexDirection: 'column',
                    zIndex: 100000,
                }}
            >
                <div
                    ref={node}
                    draggable="true"
                    style={{
                        // ...containerStyle,
                        height: '100%',
                        width: '100%',
                        // background: 'white',

                        // boxShadow: '0 6px 10px rgba(80, 80, 80,1)',
                        // background: lib.colors.white,
                        borderTopLeftRadius: lib.layout.borderRadius.largish,
                        borderTopRightRadius: lib.layout.borderRadius.largish,
                        position: 'absolute',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'transparent',
                        // background: lib.colors.transparentDarkGrey2,
                        backdropFilter: 'blur(10px)',
                        // @danny7even this seemed to cause problems with issue #67 - but it didnt solve any
                        WebkitBackdropFilter: 'blur(10px)',
                        padding: '10px',
                    }}
                >
                    <Button
                        buttonStyle={{
                            position: 'absolute',
                            boxShadow: '0 3px 5px rgba(80, 80, 80,1)',
                            bottom: 30,
                            right: 30,
                            zIndex: 100002,
                            background: lib.colors.gradient3,
                            color: 'white',
                            scale: '1.5',
                            borderRadius: lib.layout.borderRadius.large,
                        }}
                        label="back"
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setDeath(true);
                            startTransiton(() => {
                                navigate(-1);
                            });
                        }}
                    />
                    <div
                        style={{
                            overflow: 'scroll',
                            height: '100%',
                            width: '100%',
                            position: 'absolute',
                        }}
                    >
                        <MobileWallet />
                    </div>
                </div>
            </div>
        </>
    ) : null;
};

export default MobileViewScreen2;
