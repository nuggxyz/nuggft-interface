import { LiveNugg } from '@src/client/interfaces';
import { LiveNuggFragment } from '@src/gql/types.generated';
import { buildTokenIdFactory } from '@src/prototypes';
import { formatSwapData } from '@src/client/formatters/formatSwapData';
import formatNuggItems from '@src/client/formatters/formatNuggItems';

export default (nugg: LiveNuggFragment): LiveNugg => {
    const tokenId = nugg.id.toNuggId();

    return buildTokenIdFactory({
        tokenId,
        activeLoan: !!nugg.activeLoan?.id,
        owner: nugg.user?.id as AddressString,
        items: formatNuggItems(nugg),
        isBackup: false,
        pendingClaim: nugg.pendingClaim,
        lastTransfer: nugg.lastTransfer,
        swaps: nugg.swaps.map((y) => {
            return formatSwapData(y, tokenId);
        }),
        activeSwap: nugg.activeSwap ? formatSwapData(nugg.activeSwap, tokenId) : undefined,
    });
};
