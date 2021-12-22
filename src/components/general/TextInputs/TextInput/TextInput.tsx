import { UseSpringProps } from '@react-spring/core';
import { animated } from '@react-spring/web';
import React, { CSSProperties, FunctionComponent, SetStateAction } from 'react';

import Text from '../../Texts/Text/Text';

import styles from './TextInput.styles';

export interface TextInputProps {
    label?: string;
    value: string;
    setValue: React.Dispatch<SetStateAction<string>> | any;
    disabled?: boolean;
    warning?: boolean;
    style?: React.CSSProperties | UseSpringProps;
    styleInputContainer?: CSSProperties | UseSpringProps;
    styleHeading?: CSSProperties;
    styleInput?: CSSProperties;
    type?: 'text' | 'password' | 'number';
    multi?: boolean;
    border?: boolean;
    placeholder?: string;
    borderBottom?: boolean;
    code?: boolean;
    rightToggles?: JSX.Element[];
    leftToggles?: JSX.Element[];
    pattern?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
    className?: string;
    styleLabel?: CSSProperties;
}

const TextInput: FunctionComponent<TextInputProps> = ({
    label,
    value,
    setValue,
    disabled,
    warning,
    style,
    styleInputContainer,
    styleHeading,
    styleInput,
    type,
    multi = false,
    border = false,
    borderBottom = false,
    placeholder,
    code,
    rightToggles,
    leftToggles,
    pattern = '',
    inputMode,
    className,
    styleLabel,
}) => {
    const inputStyle = {
        ...styles.textInput,
        ...(multi && styles.multi),
        ...(code && styles.code),
        ...styleInput,
    };

    const headingStyle = {
        ...styles.headingContainer,
        ...(label && styles.marginTop),
        ...styleHeading,
    };

    const containerStyle = {
        ...styles.container,
        ...style,
        ...(multi && styles.containerMulti),
        ...(borderBottom && !border && styles.bottomBorder),
    };

    const subContainerStyle = {
        ...styles.subContainer,
        ...styleInputContainer,
        ...(border && styles.border),
    };

    return (
        <animated.div style={containerStyle}>
            <div style={headingStyle}>
                <Text
                    textStyle={{
                        ...styles.headingText,
                        ...styleLabel,
                    }}>
                    {label}
                </Text>
                {warning && (
                    <span style={styles.warningContainer}>
                        <p style={styles.warningText}>{warning} </p>
                        <span style={styles.warningIcon}>
                            <p style={styles.warningText}>!</p>
                        </span>
                    </span>
                )}
            </div>
            {leftToggles &&
                leftToggles.map((Toggle, index) => (
                    <div key={index}>{Toggle}</div>
                ))}
            <animated.div style={subContainerStyle}>
                {multi ? (
                    <textarea
                        className={className}
                        placeholder={placeholder}
                        style={inputStyle}
                        value={value}
                        onChange={(
                            value: React.ChangeEvent<HTMLTextAreaElement>,
                        ) => {
                            setValue(value.target.value);
                        }}
                        disabled={disabled}
                    />
                ) : (
                    <input
                        className={className}
                        placeholder={placeholder}
                        type={type}
                        style={inputStyle}
                        value={value}
                        onChange={(
                            value: React.ChangeEvent<HTMLInputElement>,
                        ) => {
                            setValue(value.target.value);
                        }}
                        pattern={pattern}
                        disabled={disabled}
                        inputMode={inputMode}
                    />
                )}
                {rightToggles &&
                    rightToggles.map((Toggle, index) => (
                        <div key={index}>{Toggle}</div>
                    ))}
            </animated.div>
        </animated.div>
    );
};

export default React.memo(TextInput);
