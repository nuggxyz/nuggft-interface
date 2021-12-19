import React, { FunctionComponent } from 'react';

import Text from '../Texts/Text/Text';

import styles from './Label.styles';

type Props = {
    basic?: boolean;
    text: string;
    containerStyles?: React.CSSProperties;
};

const Label: FunctionComponent<Props> = ({
    basic = false,
    text,
    containerStyles = {},
}) => {
    return (
        <div
            style={{
                ...styles.container,
                ...(basic ? styles.basic : {}),
                ...containerStyles,
            }}>
            <Text textStyle={styles.text}>{text}</Text>
        </div>
    );
};

export default Label;
