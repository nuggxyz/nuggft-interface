import { LiveNugg } from '@src/client/interfaces';
import { EthInt } from '@src/classes/Fraction';
import { LiveNuggFragment } from '@src/gql/types.generated';
import { buildTokenIdFactory } from '@src/prototypes';

export default (nugg: LiveNuggFragment): LiveNugg => {
    const tokenId = nugg.id.toNuggId();
    return buildTokenIdFactory({
        tokenId,
        activeLoan: !!nugg.activeLoan?.id,
        owner: nugg.user?.id as AddressString,
        items: nugg.items
            .filter((x) => x.activeSwap || x.count > 0)
            .map((y) => {
                return buildTokenIdFactory({
                    tokenId: y?.id.split('-')[0].toItemId(),
                    activeSwap: y?.activeSwap?.id,
                    feature: Number(y?.item.feature),
                    position: Number(y?.item.position),
                    count: Number(y?.count),
                    displayed: y?.displayed,
                });
            }),
        isBackup: false,
        pendingClaim: nugg.pendingClaim,
        lastTransfer: nugg.lastTransfer,
        swaps: nugg.swaps.map((y) => {
            return buildTokenIdFactory({
                tokenId,
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
            });
        }),
        activeSwap: nugg.activeSwap
            ? buildTokenIdFactory({
                  tokenId,
                  epoch: nugg.activeSwap.epoch
                      ? {
                            id: Number(nugg.activeSwap.epoch.id),
                            startblock: Number(nugg.activeSwap.epoch.startblock),
                            endblock: Number(nugg.activeSwap.epoch.endblock),
                            status: nugg.activeSwap.epoch.status,
                        }
                      : null,
                  eth: new EthInt(nugg.activeSwap.eth),
                  leader: nugg.activeSwap.leader?.id,

                  owner: nugg.activeSwap.owner?.id,

                  endingEpoch:
                      nugg.activeSwap && nugg.activeSwap.endingEpoch
                          ? Number(nugg.activeSwap.endingEpoch)
                          : null,
                  num: Number(nugg.activeSwap.num),
                  isActive: true,
                  bottom: new EthInt(nugg.activeSwap.bottom),
                  isBackup: false,
              })
            : undefined,
    });
};
