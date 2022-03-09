import gql from 'graphql-tag';

import { useFastQuery } from '@src/graphql/helpers';

export const useDotnugg = (tokenId: string) => {
    return useFastQuery<
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
        (x) => x?.data[tokenId?.startsWith('item-') ? 'item' : 'nugg']?.dotnuggRawCache,
    );
};

export default useDotnugg;
