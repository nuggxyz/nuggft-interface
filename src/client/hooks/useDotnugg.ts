import gql from 'graphql-tag';

import { useFastQuery, useFasterQuery } from '@src/graphql/helpers';

export const useDotnugg = (tokenId: string) => {
    return useFastQuery<
        { [key in 'nugg' | 'item']?: { dotnuggRawCache: Base64EncodedSvg } },
        Base64EncodedSvg
    >(
        gql`
            query OptimizedDotNugg($tokenId: ID!) {
                ${tokenId?.startsWith('item-') ? 'item' : 'nugg'}(id: $tokenId) {
                    dotnuggRawCache
                }
            }
        `,
        {
            tokenId: tokenId?.replace('item-', ''),
        },
        (x) => {
            if (x.data.nugg !== undefined) return x.data.nugg.dotnuggRawCache;
            if (x.data.item !== undefined) return x.data.item.dotnuggRawCache;
            throw new Error('useDotnugg | no value returned');
        },
    );
};

export const useDotnuggCacheOnly = (tokenId: string) => {
    return useFasterQuery<
        {
            [key in 'nugg' | 'item']?: { dotnuggRawCache: Base64EncodedSvg };
        },
        Base64EncodedSvg
    >(
        gql`
            query OptimizedDotNugg($tokenId: ID!) {
                ${tokenId?.startsWith('item-') ? 'item' : 'nugg'}(id: $tokenId) {
                    dotnuggRawCache
                }
            }
        `,
        {
            tokenId: tokenId?.replace('item-', ''),
        },
        (x) => {
            if (x.data.nugg !== undefined) return x.data.nugg.dotnuggRawCache;
            if (x.data.item !== undefined) return x.data.item.dotnuggRawCache;
            throw new Error('useDotnugg | no value returned');
        },
    );
};
