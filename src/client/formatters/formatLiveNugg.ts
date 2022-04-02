import { LiveNugg } from '@src/client/interfaces';
import { EthInt } from '@src/classes/Fraction';
import { LiveNuggFragment } from '@src/gql/types.generated';

export default (nugg: LiveNuggFragment): LiveNugg => {
    return {
        type: 'nugg' as const,
        activeLoan: !!nugg.activeLoan?.id,
        owner: nugg.user?.id,
        items: nugg.items.map((y) => {
            return {
                id: `item-${y?.id.split('-')[0]}`,
                activeSwap: y?.activeSwap?.id,
                feature: Number(y?.item.feature),
                position: Number(y?.item.position),
            };
        }),
        isBackup: false,
        pendingClaim: nugg.pendingClaim,
        lastTransfer: nugg.lastTransfer,
        swaps: nugg.swaps.map((y) => {
            return {
                type: 'nugg' as const,
                id: y?.id,
                epoch: y?.epoch
                    ? {
                          id: Number(y?.epoch.id),
                          startblock: Number(y?.epoch.startblock),
                          endblock: Number(y?.epoch.endblock),
                          status: y?.epoch.status,
                      }
                    : null,
                eth: new EthInt(y?.eth),
                leader: y?.leader?.id,
                owner: y?.owner?.id,
                endingEpoch: y && y.endingEpoch ? Number(y?.endingEpoch) : null,
                num: Number(y?.num),
                isActive: nugg.activeSwap?.id === y?.id,
                bottom: new EthInt(y?.bottom),
                isBackup: false,
            };
        }),
        activeSwap: nugg.activeSwap
            ? {
                  type: 'nugg' as const,
                  id: nugg.activeSwap?.id,
                  epoch: nugg.activeSwap?.epoch
                      ? {
                            id: Number(nugg.activeSwap.epoch.id),
                            startblock: Number(nugg.activeSwap.epoch.startblock),
                            endblock: Number(nugg.activeSwap.epoch.endblock),
                            status: nugg.activeSwap.epoch.status,
                        }
                      : null,
                  eth: new EthInt(nugg.activeSwap?.eth),
                  leader: nugg.activeSwap?.leader?.id,

                  owner: nugg.activeSwap?.owner?.id,

                  endingEpoch:
                      nugg.activeSwap && nugg.activeSwap?.endingEpoch
                          ? Number(nugg.activeSwap?.endingEpoch)
                          : null,
                  num: Number(nugg.activeSwap?.num),
                  isActive: true,
                  bottom: new EthInt(nugg.activeSwap?.bottom),
                  isBackup: false,
              }
            : undefined,
    };
};
