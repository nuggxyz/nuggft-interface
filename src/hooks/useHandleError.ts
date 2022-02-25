import { useEffect, useState } from 'react';

import { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import SwapState from '@src/state/swap';

const useHandleError = (target: string): [boolean, () => void] => {
    const [isError, setIsError] = useState(false);

    const swapError = SwapState.select.error();

    useEffect(() => {
        if (!isUndefinedOrNullOrStringEmpty(swapError)) {
            setIsError(swapError === target);
        }
    }, [swapError, target]);

    return [isError, () => setIsError(false)];
};

export default useHandleError;
