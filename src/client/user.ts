/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine } from 'zustand/middleware';
import { ApolloClient, ApolloQueryResult } from '@apollo/client';
import React from 'react';
import shallow from 'zustand/shallow';

import { EthInt } from '@src/classes/Fraction';
import { LiveUserDocument, LiveUserQuery, LiveUserQueryVariables } from '@src/gql/types.generated';
import { buildTokenIdFactory } from '@src/prototypes';
import { Address } from '@src/classes/Address';
import web3 from '@src/web3';
import { apolloClient } from '@src/web3/config';

import formatNuggItems from './formatters/formatNuggItems';
import epoch from './epoch';

export interface LoanData {
    endingEpoch: number;
    eth: EthInt;
    nugg: NuggId;
    startingEpoch: number;
}

export interface LiveNuggItem extends ItemIdFactory<TokenIdFactoryBase> {
    activeSwap: string | undefined;
    feature: number;
    position: number;
    count: number;
    displayed: boolean;
}
export interface MyNuggs {
    activeLoan: boolean;
    activeSwap: boolean;
    tokenId: NuggId;
    recent: boolean;
    pendingClaim: boolean;
    lastTransfer: number;
    items: LiveNuggItem[];
    unclaimedOffers: {
        itemId: ItemId | null;
        endingEpoch: number | null;
        eth: BigNumberish | undefined;
        sellingNuggId: NuggId | null;
    }[];
}

export interface UnclaimedOfferBase extends TokenIdFactoryBase {
    endingEpoch: number | null;
    eth: EthInt;
    leader: boolean;
    claimParams: unknown;
    nugg: unknown;
}

export type UnclaimedOffer = TokenIdFactoryCreator<
    UnclaimedOfferBase,
    {
        nugg: null;
        claimParams: {
            sellingTokenId: NuggId;
            address: AddressString;
            buyingTokenId: 'nugg-0';
            itemId: 'item-0';
        };
    },
    {
        nugg: NuggId;
        claimParams: {
            sellingTokenId: NuggId;
            address: AddressStringZero;
            buyingTokenId: NuggId;
            itemId: ItemId;
        };
    }
>;

const format = (address: AddressString, x: ApolloQueryResult<LiveUserQuery>) => {
    if (!x?.data?.user) return undefined;

    const { user } = x.data;

    const myNuggs: MyNuggs[] = user.nuggs.map((z) => {
        return {
            recent: false,
            tokenId: z.id.toNuggId(),
            activeLoan: !!z.activeLoan,
            activeSwap: !!z.activeSwap,
            pendingClaim: z.pendingClaim,
            lastTransfer: z.lastTransfer,
            items: formatNuggItems(z),
            unclaimedOffers: z.offers.map((y) => {
                return {
                    itemId: y.swap.sellingItem.id.toItemId(),
                    eth: y.eth,
                    sellingNuggId: y.swap.sellingNuggItem.nugg.id.toNuggId(),
                    endingEpoch:
                        y && y.swap && y.swap.endingEpoch ? Number(y.swap.endingEpoch) : null,
                };
            }),
        };
    });

    const myUnclaimedNuggOffers: UnclaimedOffer[] = user.offers.map((z) => {
        return buildTokenIdFactory({
            tokenId: z.swap.nugg.id.toNuggId(),
            endingEpoch: z && z.swap && z.swap.endingEpoch ? Number(z.swap.endingEpoch) : null,
            eth: new EthInt(z.eth),
            leader: z.swap.leader.id.toLowerCase() === address.toLowerCase(),
            claimParams: {
                address: address as AddressString,
                sellingTokenId: z.swap.nugg.id.toNuggId(),
                itemId: 'item-0',
                buyingTokenId: 'nugg-0',
            },
            nugg: null,
        });
    });
    const myUnclaimedItemOffers: UnclaimedOffer[] = user.nuggs
        .map((z) => {
            return z.offers.map((y) => {
                return buildTokenIdFactory({
                    tokenId: y.swap.sellingItem.id.toItemId(),
                    endingEpoch:
                        y && y.swap && y.swap.endingEpoch ? Number(y.swap.endingEpoch) : null,
                    eth: new EthInt(y.eth),
                    leader: y.swap.leader?.id === z.id,
                    nugg: z.id.toNuggId(),
                    claimParams: {
                        itemId: y.swap.sellingItem.id.toItemId(),
                        buyingTokenId: z.id.toNuggId(),
                        sellingTokenId: y.swap.sellingNuggItem.nugg.id.toNuggId(),
                        address: Address.ZERO.hash as AddressStringZero,
                    },
                });
            });
        })
        .flat();

    const myLoans: LoanData[] = user.loans.map((z) => {
        return {
            endingEpoch: Number(z.endingEpoch),
            eth: new EthInt(z.eth),
            nugg: z.nugg.id.toNuggId(),
            startingEpoch: +z.epoch.id,
        };
    });

    return {
        myNuggs,
        myUnclaimedNuggOffers,
        myUnclaimedItemOffers,
        myLoans,
    };
};

const store = create(
    combine(
        {
            nuggs: [] as MyNuggs[],
            unclaimedOffers: [] as UnclaimedOffer[],
            loans: [] as LoanData[],
        },
        (set) => {
            const fetch = (address?: AddressString, client?: ApolloClient<any>) => {
                if (!address || !client) return Promise.resolve();
                return client
                    .query<LiveUserQuery, LiveUserQueryVariables>({
                        query: LiveUserDocument,
                        variables: {
                            address,
                        },
                        fetchPolicy: 'no-cache',
                    })
                    .then((x) => {
                        const res2 = format(address, x);

                        if (!res2) return;
                        set(() => ({
                            nuggs: res2?.myNuggs,
                            loans: res2?.myLoans,
                            unclaimedOffers: [
                                ...res2.myUnclaimedItemOffers,
                                ...res2.myUnclaimedNuggOffers,
                            ],
                        }));
                    });
            };

            const wipe = () => {
                set(() => ({
                    nuggs: [],
                    loans: [],
                    unclaimedOffers: [],
                }));
            };

            return { fetch, wipe };
        },
    ),
);

export const useUserUpdater = () => {
    const address = web3.hook.usePriorityAccount();

    const fetch = store((draft) => draft.fetch);
    const wipe = store((draft) => draft.wipe);

    const callback = React.useCallback(() => {
        if (address) {
            void fetch(address as AddressString, apolloClient);
        }
    }, [fetch, address]);

    React.useEffect(() => {
        if (address) {
            void fetch(address as AddressString, apolloClient);
        } else {
            void wipe();
        }
    }, [address, fetch, wipe]);

    epoch.useCallbackOnEpochChange(callback);
};

const useUnclaimedOffersFilteredByEpoch = () => {
    const _epoch = epoch.active.useId();
    return store(
        (state) =>
            state.unclaimedOffers
                .flat()
                .filter((x) => x.endingEpoch !== null && _epoch && x.endingEpoch < _epoch)
                .sort((a, b) => ((a.endingEpoch ?? 0) > (b.endingEpoch ?? 0) ? -1 : 1)),
        shallow,
    );
};

export default {
    useNuggs: () => store((draft) => draft.nuggs),
    useUnclaimedOffers: () => store((draft) => draft.unclaimedOffers),
    useLoans: () => store((draft) => draft.loans),
    useFetch: () => store((draft) => draft.fetch),
    useUnclaimedOffersFilteredByEpoch,
    ...store,
};
