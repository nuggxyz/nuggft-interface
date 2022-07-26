import React, { CSSProperties, FunctionComponent, ReactNode } from 'react';
import { animated, PickAnimated } from '@react-spring/web';

import lib from '@src/lib';

import styles from './Text.styles';

export interface TextProps {
	children: string | string[] | ReactNode | ReactNode[];
	weight?: 'light' | 'regular' | 'bold' | 'bolder';
	size?:
		| 'smaller'
		| 'small'
		| 'medium'
		| 'large'
		| 'largerish'
		| 'larger'
		| 'largermax'
		| 'largestish'
		| 'largest';
	type?: 'title' | 'text' | 'code';
	textStyle?: PickAnimated<CSSProperties>;
	loading?: boolean;
}

const Text: FunctionComponent<TextProps> = ({
	// className,
	children,
	weight = 'regular',
	size = 'medium',
	type = 'title',
	textStyle,
	loading = false,
}) => {
	const style = {
		userSelect: 'none' as const,
		...styles[type],
		...styles[weight],
		...styles[size],
		...textStyle,
		...(loading ? lib.layout.presets.loadingText : {}),
	};
	return (
		<animated.div className={loading ? 'loading-text' : undefined} style={style}>
			{children}
		</animated.div>
	);
};

export default React.memo(Text);
