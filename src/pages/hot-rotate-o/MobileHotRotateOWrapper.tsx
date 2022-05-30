import React, { FunctionComponent } from 'react';

import HotRotateOController from '@src/pages/hot-rotate-o/HotRotateO';
import lib from '@src/lib';

type Props = Record<string, unknown>;

const MobileHotRotateOWrapper: FunctionComponent<Props> = () => {
    return (
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
                // draggable="true"
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
                    overflow: 'scroll',
                    background: 'transparent',
                }}
            >
                {/* <BackButton /> */}
                <HotRotateOController />
            </div>
        </div>
    );
};

export default MobileHotRotateOWrapper;
