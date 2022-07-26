import { throttle } from 'lodash';
import React from 'react';

export default <G, T extends (...args: any[]) => G>(arg: T, wait: number) => {
	return React.useMemo(() => throttle(arg, wait), [arg]);
};
