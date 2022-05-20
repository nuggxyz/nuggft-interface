import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import client from '@src/client';
import { useGetLiveItemQuery, useGetLiveNuggQuery } from '@src/gql/types.generated';
import formatLiveItem from '@src/client/formatters/formatLiveItem';
import formatLiveNugg from '@src/client/formatters/formatLiveNugg';

export default () => {
    const epoch = client.epoch.active.useId();

    const updateToken = client.mutate.updateToken();
    const navigate = useNavigate();

    const { fetchMore: itemLazyQuery } = useGetLiveItemQuery({});
    const { fetchMore: nuggLazyQuery } = useGetLiveNuggQuery({});

    return useCallback(
        async (tokenId: TokenId) => {
            if (!tokenId.isItemId()) {
                await nuggLazyQuery({
                    variables: { tokenId: tokenId.toRawId() },
                }).then((x) => {
                    if (x.data) {
                        if (!x.data.nugg) navigate(epoch ? `/swap/${epoch.toNuggId()}` : '/');
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
                    variables: { tokenId: tokenId.toRawId() },
                }).then((x) => {
                    if (x.data) {
                        if (!x.data.item) navigate(epoch ? `/swap/${epoch.toNuggId()}` : '/');
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
        [nuggLazyQuery, itemLazyQuery, updateToken, epoch, navigate],
    );
};
