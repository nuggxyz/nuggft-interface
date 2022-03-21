/* eslint-disable import/no-cycle */
// import lib from '@src/lib';
// import { Lifecycle, LiveToken } from '@src/client/hooks/useLiveToken';
// import { Address } from '@src/classes/Address';
// import core from '@src/client/core';

// import getItem from './getItem';
// import getNugg from './getNugg';

const getToken = async (tokenId: string) => {
    // const epoch = core.store.getState().epoch?.id;
    // const token = (await (tokenId?.startsWith(lib.constants.ID_PREFIX_ITEM)
    //     ? getItem(tokenId)
    //     : getNugg(tokenId))) as LiveToken;

    // let lifecycle = Lifecycle.Stands;
    // if (token && epoch !== undefined) {
    //     if (!token.activeSwap?.id) {
    //         if (token.type === 'item' && token.swaps.length > 0) lifecycle = Lifecycle.Tryout;
    //         lifecycle = Lifecycle.Stands;
    //     } else if (!token.activeSwap.endingEpoch) {
    //         lifecycle = Lifecycle.Bench;
    //     } else if (+token.activeSwap.endingEpoch === epoch + 1) {
    //         if (token.type === 'nugg' && token.owner === Address.ZERO.hash) {
    //             lifecycle = Lifecycle.Egg;
    //         } else {
    //             lifecycle = Lifecycle.Deck;
    //         }
    //     } else if (+token.activeSwap.endingEpoch === epoch) {
    //         lifecycle = Lifecycle.Bat;
    //     } else {
    //         lifecycle = Lifecycle.Shower;
    //     }
    // }

    // return { token, lifecycle, epoch };
};

export default getToken;
