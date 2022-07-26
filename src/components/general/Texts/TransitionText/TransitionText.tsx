import { animated, config, useSpring } from '@react-spring/web';
import React, { CSSProperties } from 'react';

import useOnHover from '@src/hooks/useOnHover';
import Text from '@src/components/general/Texts/Text/Text';

import styles from './TransitionText.styles';

type Props = {
	text: string;
	transitionText: string;
	onClick: () => void;
	style?: CSSProperties;
	textStyle?: CSSProperties;
	Icon?: React.ReactElement;
};

const TransitionText = ({ text, transitionText, onClick, style, textStyle, Icon }: Props) => {
	const [ref, isHovering] = useOnHover();

	const textStyleAnimated = useSpring({
		opacity: isHovering ? 0 : 1,
		config: config.stiff,
	});
	const transitionTextStyleAnimated = useSpring({
		opacity: isHovering ? 1 : 0,
		config: config.stiff,
	});
	return (
		<div
			aria-hidden="true"
			role="button"
			ref={ref}
			onClick={onClick}
			style={{ ...styles.container, ...style }}
		>
			{Icon && Icon}
			<div style={{ ...styles.textContainer, ...textStyle }}>
				<Text textStyle={styles.hidden}>{isHovering ? transitionText : text}</Text>
				<animated.div style={{ ...styles.text, ...textStyleAnimated }}>
					<Text>{text}</Text>
				</animated.div>
				<animated.div style={{ ...styles.text, ...transitionTextStyleAnimated }}>
					<Text>{transitionText}</Text>
				</animated.div>
			</div>
		</div>
	);
};

export default React.memo(TransitionText);
