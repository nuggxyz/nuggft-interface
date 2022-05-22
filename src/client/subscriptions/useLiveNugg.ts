import React from 'react';

import {
    useWatchLiveNuggSubscription,
    useGetLiveNuggQuery,
    useGetLiveItemQuery,
} from '@src/gql/types.generated';
import formatLiveNugg from '@src/client/formatters/formatLiveNugg';
import useLiveNuggBackup from '@src/client/backups/useLiveNuggBackup';
import client from '@src/client';
import useDevStable from '@src/hooks/useDevStable';
import formatLiveItem from '@src/client/formatters/formatLiveItem';
import { LiveItem, LiveNugg } from '@src/client/interfaces';
import useLiveItemBackup from '@src/client/backups/useLiveItemBackup';

export default (_tokenId: NuggId | undefined) => {
    const updateToken = client.mutate.updateToken();

    const tokenId = useDevStable(_tokenId);

    useWatchLiveNuggSubscription({
        shouldResubscribe: !!tokenId,

        fetchPolicy: 'cache-first',
        variables: { tokenId: tokenId?.toRawId() || '' },
        skip: !tokenId,
        onSubscriptionData: (x) => {
            if (
                tokenId &&
                !tokenId.isItemId() &&
                x.subscriptionData &&
                x.subscriptionData.data &&
                x.subscriptionData.data.nugg
            ) {
                const formatted = formatLiveNugg(x.subscriptionData.data.nugg);
                if (formatted) updateToken(tokenId, formatted);
            }
        },
    });
    const { graphProblem } = client.health.useHealth();

    useLiveNuggBackup(graphProblem, tokenId);

    return null;
};

export const useLiveTokenPoll = (activate: boolean, _tokenId: TokenId | undefined) => {
    const updateToken = client.mutate.updateToken();

    const tokenId = useDevStable(_tokenId);

    const options = React.useMemo(() => {
        return {
            fetchPolicy: 'no-cache' as const,
            variables: { tokenId: tokenId?.toRawId() || '' },
            skip: !tokenId || !activate,
        };
    }, [tokenId, activate]);

    const nuggOptions = React.useMemo(() => {
        return {
            ...options,
            skip: !options.skip && tokenId?.isItemId(),
        };
    }, [options, tokenId]);

    const itemOptions = React.useMemo(() => {
        return {
            ...options,
            skip: !options.skip && tokenId?.isNuggId(),
        };
    }, [options, tokenId]);

    const {
        data: dataNuggs,
        fetchMore: fmNuggs,
        error: errorNuggs,
    } = useGetLiveNuggQuery(nuggOptions);
    const {
        data: dataItems,
        fetchMore: fmItems,
        error: errorItems,
    } = useGetLiveItemQuery(itemOptions);

    const error = React.useMemo(() => {
        return tokenId?.isNuggId() ? errorNuggs : errorItems;
    }, [tokenId, errorItems, errorNuggs]);

    const fetchMore = React.useMemo(() => {
        return tokenId?.isNuggId()
            ? fmNuggs.bind(undefined, nuggOptions)
            : fmItems.bind(undefined, itemOptions);
    }, [fmNuggs, fmItems, nuggOptions, itemOptions, tokenId]);

    const data = React.useMemo(() => {
        return tokenId?.isNuggId() ? dataNuggs?.nugg : dataItems?.item;
    }, [tokenId, dataNuggs, dataItems]);

    client.health.useCallbackOnGraphBlockChange(fetchMore);

    React.useEffect(() => {
        if (tokenId && data) {
            let formatted: LiveNugg | LiveItem | undefined =
                data.__typename === 'Nugg' ? formatLiveNugg(data) : undefined;

            formatted = data.__typename === 'Item' ? formatLiveItem(data) : formatted;
            if (formatted) updateToken(tokenId, formatted);
        }
    }, [data, tokenId, updateToken]);

    const { graphProblem } = client.health.useHealth();

    useLiveNuggBackup(
        activate && !!tokenId?.isNuggId() && (!!error || graphProblem),
        tokenId as NuggId,
    );
    useLiveItemBackup(
        activate && !!tokenId?.isItemId() && (!!error || graphProblem),
        tokenId as ItemId,
    );

    return null;
};
