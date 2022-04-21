import { EthInt } from '@src/classes/Fraction';
import { SwapdataFragment, ItemswapdataFragment } from '@src/gql/types.generated';
import { SwapData } from '@src/client/interfaces';
import { buildTokenIdFactory } from '@src/prototypes';

export const formatSwapData = (
    z:
        | Pick<
              SwapdataFragment | ItemswapdataFragment,
              'endingEpoch' | '__typename' | 'eth' | 'leader'
          >
        | undefined
        | null,
    tokenId: string,
): SwapData => {
    const type = z!.__typename === 'Swap' ? ('nugg' as const) : ('item' as const);

    let a;

    if (type === 'item') {
        a = {
            type: 'item' as const,
            id: tokenId.toItemId(),
            tokenId: tokenId.toItemId(),
            leader: z?.leader?.id.toNuggId(),
        };
    } else {
        a = {
            type: 'nugg' as const,
            id: tokenId.toNuggId(),
            tokenId: tokenId.toNuggId(),
            leader: z?.leader?.id as AddressString,
        };
    }

    return buildTokenIdFactory({
        ...a,
        eth: new EthInt(z?.eth || 0),
        endingEpoch: z && z.endingEpoch ? Number(z.endingEpoch) : 0,
        dotnuggRawCache: undefined,
        listDataType: 'swap',
    });
};

// export const formatActiveSwapData = (
//     ...args: Parameters<typeof formatSwapData>
// ): ActiveSwapData | undefined => {
//     const res = formatSwapData(...args);

//     if (res.endingEpoch === null || !res.leader) {
//         return undefined;
//     }

//     return res as ActiveSwapData;
// };
