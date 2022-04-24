import { LiveNugg } from '@src/client/interfaces';
import { LiveNuggFragment } from '@src/gql/types.generated';
import { buildTokenIdFactory } from '@src/prototypes';
import { formatSwapData } from '@src/client/formatters/formatSwapData';

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
            return formatSwapData(y, tokenId);
        }),
        activeSwap: nugg.activeSwap ? formatSwapData(nugg.activeSwap, tokenId) : undefined,
    });
};
