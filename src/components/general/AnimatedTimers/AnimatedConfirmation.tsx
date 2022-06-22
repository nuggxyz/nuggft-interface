import React from 'react';
import { BsCheck2All } from 'react-icons/bs';

import lib from '@src/lib';
import Loader from '@src/components/general/Loader/Loader';

const AnimatedConfirmation = ({ confirmed }: { confirmed: boolean }) => {
    return (
        <div style={{ height: '90px', width: '90px' }}>
            {!confirmed ? (
                <Loader diameter="90px" color={lib.colors.primaryColor} />
            ) : (
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130.2 130.2">
                    <circle
                        className="path circle"
                        fill="none"
                        stroke={lib.colors.green}
                        strokeWidth="6"
                        strokeMiterlimit="10"
                        cx="65.1"
                        cy="65.1"
                        r="62.1"
                        style={{
                            strokeDasharray: 1000,
                            strokeDashoffset: 0,
                            WebkitAnimation: `Dash 0.9s ease-in-out`,
                            animation: `Dash 0.9s ease-in-out`,
                        }}
                    />
                    <polyline
                        className="path check"
                        fill="none"
                        stroke={lib.colors.green}
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeMiterlimit="10"
                        points="100.2,40.2 51.5,88.8 29.8,67.5 "
                        style={{
                            strokeDasharray: 1000,
                            // strokeDashoffset: 0,
                            strokeDashoffset: -100,
                            WebkitAnimation: `DashChecked 0.9s 0.35s ease-in-out forwards`,
                            animation: `DashChecked 0.9s 0.35s ease-in-out forwards`,
                        }}
                    />
                </svg>
            )}
        </div>
    );
};

export const InlineAnimatedConfirmation = ({ confirmed }: { confirmed: boolean }) => {
    return (
        <div style={{ height: '30px', width: '30px', margin: 10 }}>
            {!confirmed ? (
                <Loader diameter="30px" color={lib.colors.primaryColor} />
            ) : (
                <BsCheck2All color={lib.colors.green} size="30px" />
            )}
        </div>
    );
};

export default AnimatedConfirmation;
