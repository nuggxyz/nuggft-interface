import React, { CSSProperties, useMemo } from 'react';

import AppState from '@src/state/app';

const DangerouslySetNugg = ({
    imageUri,
    size,
    styles,
}: {
    imageUri: Base64EncodedSvg;
    styles?: CSSProperties;
    size: 'thumbnail' | 'showcase';
}) => {
    // Buffer.from is the modern version of the below atob code
    // let svg = atob(data.replace('data:image/svg+xml;base64,', ''));
    const bug = Buffer.from(imageUri.replace('data:image/svg+xml;base64,', ''), 'base64');

    const style = useMemo(() => {
        return `
        // .E:hover + .E
        //  {
        //     filter: drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));
        //     animation: pulse 2s infinite;

        // }
        // @keyframes pulse {
        //     0% {
        //       transform: scale(0.9);
        //     }
        //     40% {
        //       transform: scale(1) rotate(5deg);
        //     }
        //     80% {
        //       transform: scale(1) rotate(-5deg);
        //     }
        //     100% {
        //       transform: scale(0.9) rotate(0);
        //     }
        // }
        `;
    }, []);

    return (
        <>
            <div className="B" style={{ stroke: 'red' }} />
            <div
                style={{
                    ...styles,
                    // hack to kill the horizontal see-through lines on modern safari
                    ...(AppState.userAgent.browser.name === 'Firefox' ||
                    AppState.userAgent.browser.name === 'Safari' ||
                    AppState.userAgent.browser.name === 'Mobile Safari'
                        ? { strokeWidth: size === 'showcase' ? 1.07 : 1.5 }
                        : {}),
                }}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                    __html: bug.toString('utf8').replace('.A.B.C.D.E.F.G.H', style),
                }}
            />
        </>
    );
};

export default DangerouslySetNugg;
