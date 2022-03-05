export default {
    NUGGDEX_SEARCH_LIST_CHUNK: 10,

    BLOCKTIME: 25000,
    QUERYTIME: 10000,
    PRE_MINT_STARTING_EPOCH: 500,
    PRE_MINT_ENDING_EPOCH: 3000,
    MIN_OFFER: 0.03, //5,
    ANIMATION_DELAY: 100,
    ANIMATION_CONFIG: {
        precision: 0.001,
        frequency: 1.1,
        damping: 0.9,
        clamp: true,
    },
    NUGGDEX_ALLNUGGS_PREVIEW_COUNT: 7,
    NUGGDEX_DEFAULT_PREVIEW_COUNT: 3,
    ID_PREFIX_ITEM: 'item-',
};

export type ITEM_ID = `item-${string}`;
export function ID_PREFIX_ITEM(ID_PREFIX_ITEM: any,arg1: string) {
    throw new Error('Function not implemented.');
}

