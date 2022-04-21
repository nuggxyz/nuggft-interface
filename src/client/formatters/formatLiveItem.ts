import { LiveItem, TryoutData } from '@src/client/interfaces';
import { EthInt, Fraction2x16 } from '@src/classes/Fraction';
import { LiveItemFragment } from '@src/gql/types.generated';
import { buildTokenIdFactory } from '@src/prototypes';

export default (item: LiveItemFragment): LiveItem => {
    const tokenId = item.id.toItemId();
    const tmp: Omit<LiveItem, 'tryout'> = buildTokenIdFactory({
        tokenId,
        count: Number(item.count),
        swaps: item.swaps
            .map((y) => {
                return y
                    ? buildTokenIdFactory({
                          tokenId,
                          epoch: y.epoch
                              ? {
                                    id: Number(y.epoch?.id ?? 0),
                                    startblock: Number(y.epoch?.startblock),
                                    endblock: Number(y.epoch?.endblock),
                                    status: y.epoch.status,
                                }
                              : null,
                          eth: new EthInt(y.eth),
                          leader: y.leader!.id,
                          owner: y.owner.id,
                          endingEpoch: y && y.endingEpoch ? Number(y.endingEpoch) : null,
                          num: Number(y.num),
                          isTryout: y && y.endingEpoch === null,
                          dotnuggRawCache: null,
                          sellingNuggId: y.sellingNuggItem.nugg.id,
                          bottom: new EthInt(y.bottom),
                          isBackup: false,
                      })
                    : undefined;
            })
            .filter((x) => x) as LiveItem['swaps'],
        rarity: new Fraction2x16(item.rarityX16),
        isBackup: false,
        activeSwap: item.activeSwap
            ? buildTokenIdFactory({
                  count: 1,
                  tokenId,
                  epoch: item.activeSwap.epoch
                      ? {
                            id: Number(item.activeSwap.epoch.id),
                            startblock: Number(item.activeSwap.epoch.startblock),
                            endblock: Number(item.activeSwap.epoch.endblock),
                            status: item.activeSwap.epoch.status,
                        }
                      : null,
                  eth: new EthInt(item.activeSwap?.eth),
                  leader: item.activeSwap?.leader!.id.toNuggId(),

                  owner: item.activeSwap.owner?.id.toNuggId(),

                  endingEpoch:
                      item.activeSwap && item.activeSwap.endingEpoch
                          ? Number(item.activeSwap.endingEpoch)
                          : null,
                  num: Number(item.activeSwap?.num),
                  isTryout: false,
                  sellingNuggId: item.activeSwap?.sellingNuggItem.nugg.id.toNuggId(),
                  bottom: new EthInt(item.activeSwap?.bottom),
                  isBackup: false,
              })
            : undefined,
        upcomingActiveSwap: item.upcomingActiveSwap
            ? buildTokenIdFactory({
                  count: 1,
                  tokenId,
                  epoch: item.upcomingActiveSwap.epoch
                      ? {
                            id: Number(item.upcomingActiveSwap.epoch.id),
                            startblock: Number(item.upcomingActiveSwap.epoch.startblock),
                            endblock: Number(item.upcomingActiveSwap.epoch.endblock),
                            status: item.upcomingActiveSwap.epoch.status,
                        }
                      : null,
                  eth: new EthInt(item.upcomingActiveSwap?.eth),
                  leader: item.upcomingActiveSwap?.leader!.id.toNuggId(),
                  owner: item.upcomingActiveSwap.owner?.id.toNuggId(),
                  endingEpoch:
                      item.upcomingActiveSwap && item.upcomingActiveSwap.endingEpoch
                          ? Number(item.upcomingActiveSwap.endingEpoch)
                          : null,
                  num: Number(item.upcomingActiveSwap?.num),
                  isTryout: false,
                  sellingNuggId: item.upcomingActiveSwap?.sellingNuggItem.nugg.id.toNuggId(),
                  bottom: new EthInt(item.upcomingActiveSwap?.bottom),
                  isBackup: false,
              })
            : undefined,
    });

    if (!tmp.activeSwap && tmp.upcomingActiveSwap) {
        tmp.activeSwap = tmp.upcomingActiveSwap;
        tmp.upcomingActiveSwap = undefined;
    }

    const tryout = tmp.swaps.reduce((prev: LiveItem['tryout'] | undefined, curr) => {
        const swap: TryoutData = {
            nugg: curr.sellingNuggId,
            eth: curr.eth,
        };
        /// ////////////////////////////////////////
        // @danny7even --- nothing for you to do here, just to remind you that you, the code god, would never have added this field on an object and then forget to use it 40 lines later....
        // ..... so i didnt either and didnt spend an afternoon screwing around with the graph trying to fitgure out WHY IT WASNT WORKING
        if (!curr.isTryout) return prev;
        /// ////////////////////////////////////////

        if (!prev) {
            return {
                min: swap,
                max: swap,
                count: 1,
                swaps: [swap],
            };
        }
        return {
            min: !prev.min || prev.min.eth.gt(curr.eth) ? swap : prev.min,
            max: !prev.max || prev.max.eth.lt(curr.eth) ? swap : prev.max,
            count: prev.count + 1,
            swaps: [swap, ...prev.swaps].sort((a, b) => (a.eth.gt(b.eth) ? 1 : -1)),
        };
    }, undefined) ?? { count: 0, min: undefined, max: undefined, swaps: [] };

    return {
        ...tmp,
        tryout,
    };
};
