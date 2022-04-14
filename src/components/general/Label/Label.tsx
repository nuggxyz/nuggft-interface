import React, { FunctionComponent } from 'react';

import Text, { TextProps } from '@src/components/general/Texts/Text/Text';
import lib from '@src/lib';

type Props = {
    basic?: boolean;
    text: string;
    containerStyles?: React.CSSProperties;
    leftDotColor?: string;
} & Partial<TextProps>;

const Label: FunctionComponent<Props> = ({
    basic = false,
    text,
    containerStyles = {},
    leftDotColor,
    ...props
}) => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                padding: '0.3em 0.5em',
                borderRadius: lib.layout.borderRadius.large,
                background: lib.colors.transparentWhite,
                alignItems: 'center',
                ...(basic
                    ? {
                          background: 'none #ffffff',
                          border: '4px solid rgba(34, 36, 38, 0.35)',
                          color: 'rgba(0, 0, 0, 0.87)',
                          boxShadow: 'none',
                      }
                    : {}),
                ...containerStyles,
            }}
        >
            {leftDotColor && (
                <div
                    style={{
                        width: '.4rem',
                        height: '.4rem',
                        background: leftDotColor,
                        marginRight: '.3rem',
                        borderRadius: lib.layout.borderRadius.large,
                    }}
                />
            )}
            <Text
                textStyle={{
                    fontSize: '.7rem',
                }}
                {...props}
            >
                {text}
            </Text>
        </div>
    );
};

export default React.memo(Label);
