import React, { CSSProperties, FunctionComponent } from 'react';

import lib from '@src/lib';

import './Loader.css';

type Props = {
    style?: CSSProperties;
    color?: string;
    diameter?: CSSNumber;
    strokeWidth?: CSSNumber;
};

const Loader: FunctionComponent<Props> = ({
    style,
    color = lib.colors.blue,
    diameter = '1rem',
    strokeWidth = '2px',
}) => {
    return (
        <div
            className="loader"
            style={{
                borderRadius: '100%',
                borderBottom: `${strokeWidth} solid ${color}`,
                borderRight: `${strokeWidth} solid ${color}`,
                borderLeft: `${strokeWidth} solid ${color}`,
                borderTop: `${strokeWidth} solid transparent`,
                height: diameter,
                width: diameter,
                transform: 'rotate(0turn)',
                transition: `transform .5s ${lib.layout.animation}`,

                ...(style || {}),
                // ...(color
                //     ? {
                //           borderRightColor: color,
                //           borderLeftColor: color,
                //           borderBottomColor: color,
                //       }
                //     : {}),
            }}
        />
    );
};

export default React.memo(Loader);
