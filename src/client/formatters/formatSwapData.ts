import { EthInt } from '@src/classes/Fraction';
import { SwapdataFragment, ItemswapdataFragment } from '@src/gql/types.generated';
import { SwapData } from '@src/client/interfaces';
import { buildTokenIdFactory } from '@src/prototypes';

export const formatSwapData = <T extends TokenId>(
    z: SwapdataFragment | ItemswapdataFragment,
    tokenId: T,
): SwapData & PickFromTokenId<T, { type: 'nugg' }, { type: 'item' }> => {
    const a = {
        eth: new EthInt(z?.eth || 0),
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
        bottom: new EthInt(z.bottom),
        num: 1,
    };

    if (tokenId.isItemId()) {
        return buildTokenIdFactory({
            ...a,
            tokenId: tokenId as ItemId,
            leader: z.leader?.id.toNuggId(),
            owner: z.owner.id.toNuggId(),
            count: 0,
            isTryout: z.endingEpoch === null,
        });
    }
    return buildTokenIdFactory({
        ...a,
        tokenId: tokenId as NuggId,
        leader: z?.leader?.id as AddressString,
        owner: z.owner.id as AddressString,
    });
};
