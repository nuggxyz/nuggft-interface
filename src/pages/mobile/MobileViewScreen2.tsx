/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { FC, PropsWithChildren } from 'react';

import lib from '@src/lib';
import ViewingNuggPhone from '@src/components/mobile/ViewingNuggPhone';
import useMobileViewingNugg from '@src/client/hooks/useMobileViewingNugg';
import BackButton from '@src/components/mobile/BackButton';

// this makes the MobileViewScreen behave like a regular component
// MobileViewScreen is always rendered, just hidden and this triggers it

const MobileViewScreen2: FC<PropsWithChildren<{ onClose?: () => void }>> = () => {
    const { tokenId } = useMobileViewingNugg();

    console.log({ tokenId });

    const node = React.useRef<HTMLDivElement>(null);

    return (
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
                    backdropFilter: 'blur(30px)',
                    // @danny7even this seemed to cause problems with issue #67 - but it didnt solve any
                    WebkitBackdropFilter: 'blur(30px)',
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
                    }}
                >
                    <BackButton />

                    <ViewingNuggPhone tokenId={tokenId} />
                </div>
            </div>
        </>
    );
};

export default MobileViewScreen2;
