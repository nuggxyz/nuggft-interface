import React, { CSSProperties } from 'react';

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
    return (
        <div
            style={{
                ...styles,
                // hack to kill the horizontal see-through lines on modern safari
                ...(AppState.userAgent.browser.name === 'Safari' ||
                AppState.userAgent.browser.name === 'Mobile Safari'
                    ? { strokeWidth: size === 'showcase' ? 1.07 : 1.5 }
                    : {}),
            }}
            dangerouslySetInnerHTML={{ __html: bug.toString('utf8') }}
        />
    );
};

export default DangerouslySetNugg;
