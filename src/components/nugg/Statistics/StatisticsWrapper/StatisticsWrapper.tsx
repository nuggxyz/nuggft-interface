import React, { CSSProperties, FC, ReactNode } from 'react';

import Text from '../../../general/Texts/Text/Text';
import NLStaticImage, {
    NLStaticImageKey,
} from '../../../general/NLStaticImage';
import { isUndefinedOrNullOrStringEmpty } from '../../../../lib';

import styles from './StatisticsWrapper.styles';

export type StatisticsProps = {
    label?: string;
    transparent?: boolean;
    image?: NLStaticImageKey;
    style?: CSSProperties;
    children: ReactNode | ReactNode[];
    labelColor?: string;
};
const StatisticsWrapper: FC<StatisticsProps> = ({
    label,
    transparent = false,
    image,
    style,
    children,
    labelColor,
}) => {
    return (
        <div
            style={{
                ...styles.container,
                ...(!transparent && styles.background),
                ...style,
            }}>
            {!isUndefinedOrNullOrStringEmpty(label) && (
                <Text
                    textStyle={{
                        ...styles.title,
                        ...(!transparent && styles.titleRed),
                        ...(labelColor && { color: labelColor }),
                    }}>
                    {label}
                </Text>
            )}
            <div style={{ display: 'flex' }}>
                {!isUndefinedOrNullOrStringEmpty(image) && ''}
                {children}
            </div>
        </div>
    );
};

export default React.memo(StatisticsWrapper);
