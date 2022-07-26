import React from 'react';

import usePrevious from '@src/hooks/usePrevious';

export function logProps(Component: React.FC) {
	const LogProps = ({ ...props }) => {
		const previous = usePrevious(props);
		React.useEffect(() => {
			console.log('old props:', previous);
			console.log('new props:', props);
		}, [props, previous]);

		return <Component {...props} />;
	};

	// Note the second param "ref" provided by React.forwardRef.
	// We can pass it along to LogProps as a regular prop, e.g. "forwardedRef"
	// And it can then be attached to the Component.
	return React.forwardRef((props, ref) => {
		return <LogProps {...props} forwardedRef={ref} />;
	});
}
