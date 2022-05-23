/* eslint-disable no-nested-ternary */
import React, { FC, useMemo } from 'react';
import Decimal from 'decimal.js-light';

import { EthInt, PairInt } from '@src/classes/Fraction';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';

import StatisticsWrapper, { StatisticsProps } from './StatisticsWrapper/StatisticsWrapper';
import styles from './Statistics.styles';

type Props = Omit<StatisticsProps, 'children'> & {
    value: PairInt | Decimal | number;
    percent?: boolean;
};
const NumberStatistic: FC<Props> = ({ value, percent = false, ...props }) => {
    const val = useMemo(
        () =>
            value
                ? value instanceof EthInt
                    ? value?.decimal.toNumber()
                    : value instanceof Decimal
                    ? value?.toNumber()
                    : value
                : 0,
        [value],
    );
    return (
        <StatisticsWrapper {...props}>
            <CurrencyText
                // image={props.image}
                textStyle={styles.value}
                value={val}
                percent={percent}
            />
        </StatisticsWrapper>
    );
};

export default React.memo(NumberStatistic);
