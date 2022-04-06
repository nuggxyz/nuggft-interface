import { EthInt } from '@src/classes/Fraction';
import { SwapdataFragment, ItemswapdataFragment } from '@src/gql/types.generated';
import { SwapData } from '@src/client/interfaces';
import { createItemId } from '@src/lib/index';

export default (
    z:
        | Pick<
              SwapdataFragment | ItemswapdataFragment,
              'endingEpoch' | '__typename' | 'eth' | 'leader'
          >
        | undefined
        | null,
    tokenId: string,
    over: boolean,
): SwapData => {
    const type = z!.__typename === 'Swap' ? 'nugg' : 'item';

    if (type === 'item') {
        tokenId = createItemId(tokenId);
    }

    return {
        id: tokenId,
        tokenId,
        eth: new EthInt(z?.eth || 0),
        started: !!z?.endingEpoch,
        endingEpoch: z && z.endingEpoch ? Number(z.endingEpoch) : 0,
        type: z?.__typename === 'Swap' ? 'nugg' : 'item',
        isCurrent: true,
        dotnuggRawCache: undefined,
        listDataType: 'swap',
        over,
        leader: z?.leader?.id,
    };
};
