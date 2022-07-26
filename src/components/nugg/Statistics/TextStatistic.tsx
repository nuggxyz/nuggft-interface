import React, { FC } from 'react';

import Text from '@src/components/general/Texts/Text/Text';

import StatisticsWrapper, { StatisticsProps } from './StatisticsWrapper/StatisticsWrapper';
import styles from './Statistics.styles';

type Props = Omit<StatisticsProps, 'children'> & {
	value: string;
	percent?: boolean;
};
const TextStatistic: FC<Props> = ({ value, ...props }) => {
	return (
		<StatisticsWrapper {...props}>
			<Text
				textStyle={{
					...styles.value,
				}}
			>
				{value}
			</Text>
		</StatisticsWrapper>
	);
};

export default React.memo(TextStatistic);
