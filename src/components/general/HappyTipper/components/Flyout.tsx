import React, { CSSProperties, FunctionComponent, PropsWithChildren } from 'react';
import { animated, config, useTransition } from '@react-spring/web';

import useOnHover from '@src/hooks/useOnHover';

import styles from './Flyout.styles';

type Props = {
	button: JSX.Element;
	style?: CSSProperties;
	containerStyle?: CSSProperties;
};

const Flyout: FunctionComponent<PropsWithChildren<Props>> = ({
	style,
	button,
	children,
	containerStyle,
}) => {
	const [open, setOpen] = React.useState(false);
	const [openRef, openHover] = useOnHover(() => setOpen(true));
	const [closeRef, closeHover] = useOnHover(() => setOpen(openHover || closeHover));

	const transition = useTransition(open, {
		from: {
			width: '50px',
			height: '100px',
			zIndex: 99,
			pointerEvents: 'none',
			position: 'relative',
			top: 0,
			opacity: 0,
			y: -5,
		},
		enter: { opacity: 1, pointerEvents: 'auto', y: 0 },
		leave: { opacity: 0, pointerEvents: 'none', y: -5 },
		config: config.stiff,
	});

	return (
		<div style={containerStyle} ref={openRef}>
			<div role="button" aria-hidden="true" onClick={() => setOpen(false)}>
				{button}
			</div>
			{transition(
				(animatedStyle, _open) =>
					_open && (
						<animated.div style={animatedStyle as CSSPropertiesAnimated}>
							<div
								ref={closeRef}
								style={{
									...styles.container,
									...style,
								}}
							>
								{children}
							</div>
						</animated.div>
					),
			)}
		</div>
	);
};

export default React.memo(Flyout);
