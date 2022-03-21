// import gql from 'graphql-tag';

// import { executeQuery3 } from '@src/graphql/helpers';
// // eslint-disable-next-line import/no-cycle
// import { liveNuggGql, LiveNuggGql } from '@src/client/hooks/useLiveNugg';
// import { EthInt } from '@src/classes/Fraction';

const getNugg = async (tokenId: string) => {
    // const nugg = await executeQuery3<LiveNuggGql>(
    //     gql`query getNugg($tokenId: ID!) ${liveNuggGql()}`,
    //     {
    //         tokenId,
    //     },
    // ).then((x) => {
    //     if (x && x.nugg) {
    //         return {
    //             type: 'nugg',
    //             activeLoan: !!x.nugg.activeLoan?.id,
    //             owner: x.nugg.user?.id,
    //             items: x.nugg.items.map((y) => {
    //                 return {
    //                     id: y?.id,
    //                     activeSwap: y?.activeSwap?.id,
    //                     feature: y?.item.feature,
    //                     position: y?.item.position,
    //                 };
    //             }),
    //             swaps: x.nugg.swaps.map((y) => {
    //                 return {
    //                     type: 'nugg',
    //                     id: y?.id,
    //                     epoch: {
    //                         id: Number(y?.epoch?.id),
    //                         startblock: Number(y?.epoch?.startblock),
    //                         endblock: Number(y?.epoch?.endblock),
    //                         status: y?.epoch?.status,
    //                     },
    //                     eth: new EthInt(y?.eth),
    //                     leader: y?.leader?.id,
    //                     owner: y?.owner?.id,
    //                     endingEpoch: y && y.endingEpoch ? Number(y?.endingEpoch) : null,
    //                     num: Number(y?.num),
    //                     isActive: x?.nugg.activeSwap?.id === y?.id,
    //                 };
    //             }),
    //             activeSwap: x.nugg.activeSwap
    //                 ? {
    //                       type: 'nugg',
    //                       id: x.nugg.activeSwap?.id,
    //                       epoch: {
    //                           id: Number(x.nugg.activeSwap?.epoch?.id),
    //                           startblock: Number(x.nugg.activeSwap?.epoch?.startblock),
    //                           endblock: Number(x.nugg.activeSwap?.epoch?.endblock),
    //                           status: x.nugg.activeSwap?.epoch?.status,
    //                       },
    //                       eth: new EthInt(x.nugg.activeSwap?.eth),
    //                       leader: x.nugg.activeSwap?.leader?.id,

    //                       owner: x.nugg.activeSwap?.owner?.id,

    //                       endingEpoch:
    //                           x.nugg.activeSwap && x.nugg.activeSwap?.endingEpoch
    //                               ? Number(x.nugg.activeSwap?.endingEpoch)
    //                               : null,
    //                       num: Number(x.nugg.activeSwap?.num),
    //                       isActive: true,
    //                   }
    //                 : undefined,
    //             // svg: x.nugg.dotnuggRawCache as any,
    //         };
    //     }
    //     return undefined;
    // });

    // return nugg;
};

export default getNugg;
