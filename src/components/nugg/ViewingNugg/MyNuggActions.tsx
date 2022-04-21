import React, { FunctionComponent } from 'react';

import client from '@src/client';
import useViewingNugg from '@src/client/hooks/useViewingNugg';

import LoanButtons from './ActionButtons/LoanButtons';
import OwnerButtons from './ActionButtons/OwnerButtons';
import SaleButtons from './ActionButtons/SaleButtons';

type Props = Record<string, never>;

const MyNuggActions: FunctionComponent<Props> = () => {
    const { safeTokenId: tokenId } = useViewingNugg();
    const token = client.live.token(tokenId);

    return tokenId && token && token.type === 'nugg' && tokenId.isNuggId() ? (
        token?.activeSwap?.id || token?.pendingClaim ? (
            <SaleButtons tokenId={tokenId} reclaim={!token?.pendingClaim} />
        ) : token?.activeLoan && token.type === 'nugg' ? (
            <LoanButtons tokenId={tokenId} />
        ) : (
            <OwnerButtons tokenId={tokenId} />
        )
    ) : null;
};

export default MyNuggActions;
