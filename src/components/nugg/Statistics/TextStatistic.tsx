import React, { FC } from 'react';

import { EthInt } from '../../../classes/Fraction';
import Text from '../../general/Texts/Text/Text';
import { isUndefinedOrNullOrStringEmpty } from '../../../lib';

import StatisticsWrapper, {
    StatisticsProps,
} from './StatisticsWrapper/StatisticsWrapper';
import styles from './Statistics.styles';

type Props = Omit<StatisticsProps, 'children'> & {
    value: EthInt | string;
    percent?: boolean;
};
const TextStatistic: FC<Props> = ({ value, percent = false, ...props }) => {
    return (
        <StatisticsWrapper {...props}>
            <Text
                size="small"
                textStyle={{
                    ...styles.value,
                }}>
                {!isUndefinedOrNullOrStringEmpty(value)
                    ? value
                    : (value as any)?.formatAmount()}
            </Text>
        </StatisticsWrapper>
    );
};

export default React.memo(TextStatistic);
