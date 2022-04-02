import { BigNumber, ethers } from 'ethers';

import { EthInt } from '@src/classes/Fraction';
import { ItemId } from '@src/client/router';

const agency = (_agency: BigNumberish) => {
    const bn = BigNumber.from(_agency);
    return {
        address: ethers.utils.hexZeroPad(bn.mask(160)._hex, 20),
        eth: EthInt.fromNuggftV1Agency(_agency),
        epoch: bn.shr(230).mask(24).toNumber(),
        flag: bn.shr(254).toNumber(),
    };
};

const proof = (_proof: BigNumberish): { id: ItemId; feature: number; position: number }[] => {
    let working = BigNumber.from(_proof);

    const items: { id: ItemId; feature: number; position: number }[] = [];
    do {
        const curr = working.and('65535');
        if (!curr.eq(0)) {
            items.push({
                id: `item-${curr.toString()}`,
                feature: curr.shr(8).toNumber(),
                position: curr.and(0xff).toNumber(),
            });
        }
        // eslint-disable-next-line no-cond-assign
    } while (!(working = working.shr(16)).isZero());

    return items;
};

export default { agency, proof };
