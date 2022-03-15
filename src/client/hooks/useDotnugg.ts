/* eslint-disable @typescript-eslint/no-unsafe-return */
import gql from 'graphql-tag';
import React, { useEffect } from 'react';

import { useFastQuery, useFasterQuery } from '@src/graphql/helpers';
import web3 from '@src/web3';
import NuggftV1Helper from '@src/contracts/NuggftV1Helper';
import { TokenId } from '@src/client/router';

// eslint-disable-next-line import/no-cycle
import client from '..';

type UseDotnuggResponse = Base64EncodedSvg | undefined | null;

export const useDotnuggRpcBackup = (outer: UseDotnuggResponse, tokenId: TokenId) => {
    const provider = web3.hook.usePriorityProvider();
    const chainId = web3.hook.usePriorityChainId();
    const apollo = client.live.apollo();

    const [src, setSrc] = React.useState<Base64EncodedSvg>();

    useEffect(() => {
        if (tokenId && apollo && chainId && provider && outer === null) {
            void (async () => {
                const res = (await new NuggftV1Helper(chainId, provider).contract.imageURI(
                    tokenId,
                )) as Base64EncodedSvg | undefined;
                setSrc(res);

                void apollo.cache.writeQuery({
                    // broadcast: true,
                    query: gql`
                        query ROOT_QUERY($tokenId: ID!) {
                            nugg(id: $tokenId) {
                                __typename
                                dotnuggRawCache
                            }
                        }
                    `,
                    variables: { tokenId },
                    // overwrite: true,
                    data: {
                        nugg: {
                            __typename: 'Nugg',
                            dotnuggRawCache: res,
                        },
                    },
                });
            })();
        }
    }, [apollo, chainId, provider, tokenId, outer]);

    return src;
};

export const useDotnugg = (tokenId: string) => {
    const main = useFastQuery<
        { [key in 'nugg' | 'item']?: { dotnuggRawCache: Base64EncodedSvg } },
        UseDotnuggResponse
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
            return null;
        },
    );

    const fallback = useDotnuggRpcBackup(main, tokenId);
    return main || fallback;
};

export const useDotnuggCacheOnly = (tokenId: string) => {
    const main = useFasterQuery<
        {
            [key in 'nugg' | 'item']?: { dotnuggRawCache: Base64EncodedSvg };
        },
        UseDotnuggResponse
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
            if (x.data.nugg) return x.data.nugg.dotnuggRawCache;
            if (x.data.item) return x.data.item.dotnuggRawCache;
            return null;
        },
    );

    const fallback = useDotnuggRpcBackup(main, tokenId);
    return main || fallback;
};
