import React from 'react';
import { useNavigate } from 'react-router-dom';
import { To } from 'react-router';
import { BsHouseFill } from 'react-icons/bs';
import { IoChevronBackCircle } from 'react-icons/io5';

import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';

export default ({
    onClick,
    to,
    noNavigate,
    showHome = true,
}: {
    onClick?: () => void;
    to?: To;
    noNavigate?: boolean;
    showHome?: boolean;
}) => {
    const navigate = useNavigate();
    const [, startTransition] = React.useTransition();
    return (
        <div
            style={{
                position: 'absolute',
                bottom: 30,
                right: 30,
                zIndex: 3000002,
            }}
        >
            {showHome && (
                <Button
                    className="mobile-pressable-div"
                    buttonStyle={{
                        boxShadow: lib.layout.boxShadow.dark,
                        scale: '1.3',
                        background: lib.colors.gradient3,
                        color: 'white',
                        borderRadius: lib.layout.borderRadius.large,
                        marginBottom: 20,
                    }}
                    leftIcon={<BsHouseFill style={{ marginRight: 5, marginLeft: -5 }} />}
                    label="home"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        // setDeath(true);
                        if (onClick) onClick();
                        if (!noNavigate)
                            startTransition(() => {
                                navigate('/');
                            });
                    }}
                />
            )}
            <Button
                className="mobile-pressable-div"
                buttonStyle={{
                    boxShadow: lib.layout.boxShadow.dark,
                    scale: '1.3',
                    background: lib.colors.gradient3,
                    color: 'white',
                    borderRadius: lib.layout.borderRadius.large,
                }}
                leftIcon={<IoChevronBackCircle style={{ marginRight: 5, marginLeft: -5 }} />}
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
        </div>
    );
};
