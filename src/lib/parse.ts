import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';
import { hexZeroPad } from '@ethersproject/bytes';

const agency = (_agency: BigNumberish) => {
    const bn = BigNumber.from(_agency);
    const address = bn.mask(160);
    return {
        address: hexZeroPad(address._hex, 20) as AddressString,
        addressAsBigNumber: address,
        eth: bn.shr(160).mask(70).mul(100000000),
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
                tokenId: curr.shr(24).toString().toItemId(),
                endingEpoch: curr.mask(24).toNumber(),
            });
        }
        // eslint-disable-next-line no-cond-assign
    } while (!(working = working.shr(48)).isZero());

    return items;
};

const stake = (cache: BigNumberish) => {
    const bn = BigNumber.from(cache);
    return {
        shares: bn.shr(192),
        staked: bn.shr(96).mask(96),
    };
};

const proof = (_proof: BigNumberish) => {
    let working = BigNumber.from(_proof);

    const seen: Dictionary<{
        tokenId: ItemId;
        feature: number;
        position: number;
        count: number;
        displayed: boolean;
    }> = {};

    const seenFeatures: Dictionary<boolean> = {};

    let index = 0;
    do {
        const curr = working.and('65535');
        if (!curr.eq(0)) {
            if (!seen[curr._hex]) {
                seen[curr._hex] = {
                    tokenId: curr.toString().toItemId(),
                    feature: curr.div(1000).toNumber(),
                    position: curr.mod(1000).toNumber(),
                    count: 1,
                    displayed: !seenFeatures[curr.div(1000).toNumber()] && index < 8,
                };
                seenFeatures[curr.div(1000).toNumber()] = true;
            } else {
                seen[curr._hex].count++;
            }
            seenFeatures[curr.div(1000).toNumber()] = true;
        }
        index++;
    } while (!(working = working.shr(16)).isZero());

    return Object.values(seen);
};

function chunkString(str: string, length: number) {
    return str.match(new RegExp(`.{1,${length}}`, 'g'));
}

function sloop(str: string) {
    const chunked = chunkString(str.slice(2), 37 * 2);

    if (!chunked) return [];

    const res: {
        itemId: ItemId;
        nuggId: NuggId;
        agency: ReturnType<typeof agency>;
        sorter: number;
    }[] = [];

    for (let index = 0; index < chunked.length; index++) {
        const chunk = chunked[index];

        const strAgency = chunk.slice(0, 32 * 2);

        const ag = agency(`0x${strAgency}`);

        const itemId = Number(`0x${chunk.slice(64, 68)}`).toItemId();
        const nuggId = Number(`0x${chunk.slice(68)}`).toNuggId();

        res.push({
            agency: ag,
            itemId,
            nuggId,
            sorter: itemId === 'item-0' ? nuggId.toRawIdNum() : itemId.toRawIdNum(),
        });
    }

    return res.sort((a, b) => b.sorter - a.sorter);
}

function tloop(str: string) {
    const chunked = chunkString(str.slice(2), 3 * 2);

    if (!chunked) return [];

    const res: number[] = [];

    for (let index = 0; index < chunked.length; index++) {
        const chunk = chunked[index];

        res.push(Number(`0x${chunk.slice(0, 3 * 2)}`));
    }

    return res.sort((a, b) => a - b).map((e) => e.toNuggId());
}

function iloop(str: string) {
    const chunked = chunkString(str.slice(2), 2 * 2);

    if (!chunked) return [];

    const res: number[] = [];

    for (let index = 0; index < chunked.length; index++) {
        const chunk = chunked[index];

        res.push(Number(`0x${chunk.slice(0, 2 * 2)}`));
    }

    return res.sort((a, b) => a - b).map((e) => e.toItemId());
}

export default { agency, proof, lastItemSwap, chunkString, sloop, tloop, iloop, stake };
