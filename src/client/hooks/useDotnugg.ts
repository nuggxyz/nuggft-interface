import { useState, useLayoutEffect } from 'react';

import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import {
    isUndefinedOrNullOrStringEmptyOrZeroOrStringZero,
    isUndefinedOrNullOrStringEmpty,
} from '@src/lib';

const useDotnugg = (tokenId: string) => {
    const [src, setSrc] = useState<Base64EncodedSvg>();

    useLayoutEffect(() => {
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
    }, [tokenId]);

    return src;
};
export default useDotnugg;
