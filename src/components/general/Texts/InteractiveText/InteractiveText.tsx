import React, { CSSProperties, FunctionComponent, ReactChild, useState } from 'react';

import Text, { TextProps } from '@src/components/general/Texts/Text/Text';
import { SimpleSizes } from '@src/lib/layout';

import styles from './InteractiveText.styles';

export type InteractiveTextProps = {
	action: () => void;
	children: string | string[] | ReactChild | ReactChild[];
	isActive?: boolean;
	style?: CSSProperties;
	styleText?: CSSProperties;
	textSize?: SimpleSizes;
	badge?: number | string;
	leftIcon?: JSX.Element;
	rightIcon?: JSX.Element;
	color?: string;
	hideBorder?: boolean;
} & Partial<TextProps>;

const InteractiveText: FunctionComponent<InteractiveTextProps> = ({
	action,
	children,
	isActive = false,
	style,
	styleText,
	textSize = 'medium',
	badge,
	leftIcon,
	rightIcon,
	color,
	hideBorder,
	...props
}) => {
	const [hover, setHover] = useState(false);

	const customStyle = {
		...styles.container,
		...style,
	};

	const textStyle = {
		...styles.innerContainer,
		...styles.text,
		...(color ? { color } : {}),
		...((isActive || hover) && styles.selected),
	};

	const borderStyle = {
		...styles.border,
		...(color ? { background: color } : {}),
		...((isActive || hover) && styles.borderSelected),
	};

	const badgeStyle = {
		...styles.badgeStyle,
		...((isActive || hover) && styles.badgeSelected),
	};

	return (
		<>
			{badge && <div style={badgeStyle}>{badge}</div>}
			<div
				aria-hidden="true"
				role="button"
				style={customStyle}
				onClick={action}
				onMouseEnter={() => setHover(true)}
				onMouseLeave={() => setHover(false)}
			>
				<div>
					<div style={textStyle}>
						{leftIcon && leftIcon}
						<Text size={textSize} textStyle={styleText} {...props}>
							{children}
						</Text>
						{rightIcon && rightIcon}
					</div>
					{!hideBorder && <div style={borderStyle} />}
				</div>
			</div>
		</>
	);
};

export default React.memo(InteractiveText);
