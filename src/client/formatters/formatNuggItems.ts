import { buildTokenIdFactory } from '@src/prototypes';
import { NuggitemsFragment } from '@src/gql/types.generated';
import { LiveNuggItem } from '@src/client/interfaces';

export default (z: NuggitemsFragment): LiveNuggItem[] => {
    const l = z.items
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
        });

    return l;
};
