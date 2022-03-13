import { BigNumber } from 'ethers';

import { EthInt } from '@src/classes/Fraction';

const agency = (_agency: string) => {
    const bn = BigNumber.from(_agency);

    return {
        address: bn.mask(160)._hex,
        eth: EthInt.fromNuggftV1Agency(_agency),
        epoch: bn.shr(230).mask(24),
        flag: bn.shr(254),
    };
};

export default { agency };
