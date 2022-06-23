import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import client from '@src/client';
import { useGetLiveItemLazyQuery, useGetLiveNuggLazyQuery } from '@src/gql/types.generated';
import formatLiveItem from '@src/client/formatters/formatLiveItem';
import formatLiveNugg from '@src/client/formatters/formatLiveNugg';
import useLiveNuggBackup from '@src/client/backups/useLiveNuggBackup';
import useLiveItemBackup from '@src/client/backups/useLiveItemBackup';

export default () => {
    const epoch = client.epoch.active.useId();

    const updateToken = client.mutate.updateToken();
    const navigate = useNavigate();

    const [itemLazyQuery] = useGetLiveItemLazyQuery({});
    const [nuggLazyQuery] = useGetLiveNuggLazyQuery({});

    const nuggBackup = useLiveNuggBackup();

    const itemBackup = useLiveItemBackup();

    const graph = useCallback(
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

    const rpc = useCallback(
        async (tokenId: TokenId) => {
            if (!tokenId.isItemId()) {
                await nuggBackup(tokenId);
            } else {
                await itemBackup(tokenId);
            }
        },
        [nuggBackup, itemBackup],
    );

    return [graph, rpc];
};
