import React, { FunctionComponent, useCallback, useMemo } from 'react';

import useOnHover from '@src/hooks/useOnHover';
import Text, { TextProps } from '@src/components/general/Texts/Text/Text';

import styles from './Button.styles';

export type ButtonProps = {
    onClick: React.MouseEventHandler<HTMLDivElement>;
    label?: string;
    buttonStyle?: React.CSSProperties;
    textStyle?: React.CSSProperties;
    rightIcon?: JSX.Element;
    leftIcon?: JSX.Element;
    hoverStyle?: React.CSSProperties;
    disabled?: boolean;
    isHovering?: (hover: boolean) => void;
} & Partial<TextProps>;

const Button: FunctionComponent<ButtonProps> = ({
    onClick,
    label,
    buttonStyle,
    rightIcon,
    leftIcon,
    disabled = false,
    isHovering,
    hoverStyle,
    ...textProps
}) => {
    const [ref, hover] = useOnHover(isHovering);

    const style = useMemo(() => {
        return {
            ...styles.button,
            ...(hover && !disabled ? { filter: 'brightness(.8)' } : {}),
            ...(disabled ? { opacity: '0.3' } : {}),
            cursor: disabled ? 'not-allowed' : 'pointer',
            ...buttonStyle,
            ...(hover && hoverStyle),
        };
    }, [hover, disabled, buttonStyle, hoverStyle]);

    const RightIcon = useCallback(() => rightIcon || null, [rightIcon]);

    const LeftIcon = useCallback(() => leftIcon || null, [leftIcon]);

    return (
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        <div
            aria-hidden="true"
            role="button"
            ref={ref}
            onClick={disabled ? undefined : onClick}
            style={style}
        >
            <LeftIcon />
            {label ? <Text {...textProps}>{label}</Text> : null}
            <RightIcon />
        </div>
    );
};

export default React.memo(Button);
