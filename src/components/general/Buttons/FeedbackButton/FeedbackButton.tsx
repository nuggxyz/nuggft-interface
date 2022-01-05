import React, { FunctionComponent, useEffect, useState } from 'react';

import Button, { ButtonProps } from '../Button/Button';

type Props = ButtonProps & {
    feedbackText: string;
    timeout?: number;
};

const FeedbackButton: FunctionComponent<Props> = ({
    feedbackText,
    onClick,
    disabled,
    label,
    timeout = 10000,
    ...props
}) => {
    const [clicked, setClicked] = useState(false);

    useEffect(() => {
        if (clicked) {
            const id = setTimeout(() => setClicked(false), timeout);
            return () => {
                clearTimeout(id);
            };
        }
    }, [clicked, timeout]);

    return (
        <Button
            {...props}
            disabled={clicked || disabled}
            label={clicked ? feedbackText : label}
            onClick={() => {
                setClicked(true);
                onClick();
            }}
        />
    );
};

export default FeedbackButton;
