import React, { CSSProperties, FunctionComponent, ReactNode } from 'react';

import styles from './Text.styles';

export interface TextProps {
    children: string | string[] | ReactNode;
    weight?: 'light' | 'regular' | 'bold' | 'bolder';
    size?: 'smaller' | 'small' | 'medium' | 'large' | 'larger' | 'largest';
    type?: 'title' | 'text' | 'code';
    textStyle?: CSSProperties;
}

const Text: FunctionComponent<TextProps> = ({
    children,
    weight = 'regular',
    size = 'medium',
    type = 'title',
    textStyle,
}) => {
    const style = {
        ...styles[type],
        ...styles[weight],
        ...styles[size],
        ...textStyle,
    };
    return <div style={style}>{children}</div>;
};

export default React.memo(Text);
