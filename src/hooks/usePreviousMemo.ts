import React, { DependencyList } from 'react';

import usePrevious from './usePrevious';

const usePreviousMemo = <T>(factory: () => T, deps: DependencyList | undefined): T => {
    const val = React.useMemo(factory, deps);

    const [trueVal, setTrueVal] = React.useState(val);

    const prevVal = usePrevious(val);

    React.useEffect(() => {
        if (val !== prevVal) {
            setTrueVal(val);
        }
    }, [val, prevVal]);

    return trueVal;
};
export default usePreviousMemo;
