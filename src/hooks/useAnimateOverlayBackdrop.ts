import { CSSProperties } from 'react';
import { PickAnimated } from '@react-spring/web';

import useDimensions from '@src/client/hooks/useDimensions';
import packages from '@src/packages';
import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
	wrapper: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		// background: 'transparent',
		// background: lib.colors.transparentDarkGrey2,

		overflow: 'hidden',
		zIndex: 999,
	},
	mobile: {},
});

export default (isOpen: boolean, style?: CSSProperties, delay?: number) => {
	const [screenType] = useDimensions();

	const [wrapperStyle] = packages.spring.useSpring(
		{
			from: {
				opacity: 0,
				pointerEvents: 'none' as const,
			},
			opacity: isOpen ? 1 : 0,
			pointerEvents: isOpen ? ('auto' as const) : ('none' as const),
			config: packages.spring.config.stiff,
			delay,
		},
		[isOpen],
	);

	return {
		// animationDelay: delay,
		// animationDuration: '1s',
		// animationName: 'all',
		// animationDirection: isOpen ? 'normal' : 'reverse',
		// animationTimingFunction: lib.layout.animation,
		// @ts-ignore
		...styles.wrapper,

		...(screenType === 'phone'
			? {
					justifyContent: 'center',
					alignItems: 'flex-start',
			  }
			: {
					justifyContent: 'center',
					alignItems: 'center',
			  }),
		...style,
		backdropFilter: 'blur(50px)',
		// @danny7even this seemed to cause problems with issue #67 - but it didnt solve any
		WebkitBackdropFilter: 'blur(50px)',
		...wrapperStyle,
	} as const as PickAnimated<CSSProperties>;
};
