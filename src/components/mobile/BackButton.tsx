import React from 'react';
import { useNavigate } from 'react-router-dom';
import { To } from 'react-router';

import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';

export default ({
    onClick,
    to,
    noNavigate,
}: {
    onClick?: () => void;
    to?: To;
    noNavigate?: boolean;
}) => {
    const navigate = useNavigate();
    const [, startTransition] = React.useTransition();
    return (
        <Button
            buttonStyle={{
                position: 'absolute',
                boxShadow: '0 3px 5px rgba(80, 80, 80,1)',
                bottom: 30,
                right: 30,
                zIndex: 3000002,
                background: lib.colors.gradient3,
                color: 'white',
                scale: '1.5',
                borderRadius: lib.layout.borderRadius.large,
            }}
            label="back"
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                // setDeath(true);
                if (onClick) onClick();
                if (!noNavigate)
                    startTransition(() => {
                        if (to) navigate(to);
                        else navigate(-1);
                    });
            }}
        />
    );
};
