import { BigNumber, ethers } from 'ethers';

import { EthInt } from '@src/classes/Fraction';
import { ItemId, TokenId } from '@src/client/router';

const agency = (_agency: BigNumberish) => {
    const bn = BigNumber.from(_agency);
    const address = bn.mask(160);
    return {
        address: ethers.utils.hexZeroPad(address._hex, 20),
        addressAsBigNumber: address,
        eth: EthInt.fromNuggftV1Agency(_agency),
        epoch: bn.shr(230).mask(24).toNumber(),
        flag: bn.shr(254).toNumber(),
    };
};

const lastItemSwap = (_lis: BigNumber) => {
    const items: { tokenId: TokenId; endingEpoch: number }[] = [];

    let working = BigNumber.from(_lis);

    do {
        const curr = working.mask(48);
        if (!curr.isZero()) {
            items.push({
                tokenId: curr.shr(24).toString(),
                endingEpoch: curr.mask(24).toNumber(),
            });
        }
        // eslint-disable-next-line no-cond-assign
    } while (!(working = working.shr(48)).isZero());

    return items;
};

const proof = (_proof: BigNumberish) => {
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

export default { agency, proof, lastItemSwap };
