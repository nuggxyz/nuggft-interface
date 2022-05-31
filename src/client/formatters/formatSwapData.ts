import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';

import { SwapdataFragment, ItemswapdataFragment } from '@src/gql/types.generated';
import { buildTokenIdFactory } from '@src/prototypes';
import { SwapData } from '@src/client/swaps';
import web3 from '@src/web3';

export const formatSwapData = <T extends TokenId>(
    z: SwapdataFragment | ItemswapdataFragment,
    tokenId: T,
): SwapData & PickFromTokenId<T, { type: 'nugg' }, { type: 'item' }> => {
    const maybeEth = BigNumber.from(z?.top || z.bottom);
    const a = {
        eth: maybeEth.gt(0) ? maybeEth : web3.constants.MIN_SALE_PRICE,
        endingEpoch: z.endingEpoch ? Number(z.endingEpoch) : null,
        epoch: z.epoch
            ? {
                  id: Number(z.epoch.id),
                  startblock: Number(z.epoch.startblock),
                  endblock: Number(z.epoch.endblock),
                  status: z.epoch.status,
              }
            : null,
        listDataType: 'swap' as const,
        isBackup: false,
        bottom: BigNumber.from(z.bottom),
        num: BigNumber.from(z.num).toNumber(),
        offers: z.offers.map((x) => ({
            eth: BigNumber.from(x.eth),
            account: 'nugg' in x ? x.nugg.id : x.user.id,
            txhash: x.txhash,
            incrementX64: BigNumber.from(x.incrementX64),
        })),
        canceledEpoch: z.canceledEpoch ? Number(z.canceledEpoch) : null,
        startUnix: z?.startUnix ? BigNumber.from(z.startUnix).toNumber() : undefined,
    };

    if (tokenId.isItemId()) {
        return buildTokenIdFactory({
            ...a,
            tokenId: tokenId as ItemId,
            leader: z.leader?.id.toNuggId(),
            owner: z.owner.id.toNuggId(),
            count: 0,
            isTryout: z.endingEpoch === null,
            offers: a.offers.map((x) => ({ ...x, account: x.account.toNuggId() })),
        });
    }
    return buildTokenIdFactory({
        ...a,
        tokenId: tokenId as NuggId,
        leader: z?.leader?.id as AddressString,
        owner: z.owner.id as AddressString,
        offers: a.offers.map((x) => ({ ...x, account: x.account as AddressString })),
    });
};
