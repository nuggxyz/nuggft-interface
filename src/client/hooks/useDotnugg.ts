import { useState, useLayoutEffect } from 'react';

import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import {
    isUndefinedOrNullOrStringEmptyOrZeroOrStringZero,
    isUndefinedOrNullOrStringEmpty,
} from '@src/lib';

const useDotnugg = (tokenId: string, data?: Base64EncodedSvg) => {
    const [src, setSrc] = useState<Base64EncodedSvg>();

    useLayoutEffect(() => {
        if (data) setSrc(data);
        else {
            let unmounted = false;

            const getDotNuggSrc = async () => {
                if (!isUndefinedOrNullOrStringEmptyOrZeroOrStringZero(tokenId)) {
                    const data = await NuggftV1Helper.optimizedDotNugg(tokenId);
                    if (!isUndefinedOrNullOrStringEmpty(data) && !unmounted) {
                        setSrc(data);
                    }
                }
            };
            getDotNuggSrc();

            return () => {
                unmounted = true;
            };
        }
    }, [tokenId, data]);

    return src;
};
export default useDotnugg;
