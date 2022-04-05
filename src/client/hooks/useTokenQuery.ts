import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import client from '@src/client';
import { TokenId } from '@src/client/router';
import { useGetLiveItemLazyQuery, useGetLiveNuggLazyQuery } from '@src/gql/types.generated';
import { extractItemId } from '@src/lib';
import formatLiveItem from '@src/client/formatters/formatLiveItem';
import formatLiveNugg from '@src/client/formatters/formatLiveNugg';

export default () => {
    const graph = client.live.graph();
    const epoch = client.live.epoch.id();

    const updateToken = client.mutate.updateToken();
    const navigate = useNavigate();

    const [itemLazyQuery] = useGetLiveItemLazyQuery({ client: graph });
    const [nuggLazyQuery] = useGetLiveNuggLazyQuery({ client: graph });

    return useCallback(
        async (tokenId: TokenId) => {
            if (!tokenId.isItemId()) {
                await nuggLazyQuery({
                    variables: { tokenId },
                }).then((x) => {
                    if (x.data) {
                        if (!x.data.nugg) navigate(epoch ? `/swap/${epoch}` : '/');
                        else {
                            const formatted = formatLiveNugg(x.data.nugg);
                            if (formatted) {
                                updateToken(tokenId, formatted);
                            }
                        }
                    }
                });
            } else {
                await itemLazyQuery({
                    variables: { tokenId: extractItemId(tokenId) },
                }).then((x) => {
                    if (x.data) {
                        if (!x.data.item) navigate(epoch ? `/swap/${epoch}` : '/');
                        else {
                            const formatted = formatLiveItem(x.data.item);
                            if (formatted) {
                                updateToken(tokenId, formatted);
                            }
                        }
                    }
                });
            }
        },
        [nuggLazyQuery, itemLazyQuery, updateToken],
    );
};
