import React, { CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';

import Text from '@src/components/general/Texts/Text/Text';
import Jazzicon from '@src/components/nugg/Jazzicon';

export default ({
    address,
    style,
    text,
    size = 35,
    color = 'rgba(255,255,255, .8)',
    iconDropShadow,
}: {
    address: string;
    color?: string;
    style?: CSSProperties;
    text?: string;
    size?: number;
    iconDropShadow?: string;
}) => {
    const navigate = useNavigate();

    return (
        <div
            aria-hidden="true"
            style={{
                background: 'transparent',
                padding: '.5rem .3rem',
            }}
            onClick={(event) => {
                event?.stopPropagation();
                navigate('/wallet');
            }}
            className="mobile-pressable-div"
        >
            <Jazzicon
                address={address}
                size={size}
                style={{ boxShadow: iconDropShadow, ...style }}
            />
            {text && (
                <Text textStyle={{ color }} size="small">
                    {text}
                </Text>
            )}
        </div>
    );
};
