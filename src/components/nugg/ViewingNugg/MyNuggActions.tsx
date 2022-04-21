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

    return tokenId && token && token.isNugg() ? (
        token?.activeSwap?.tokenId || token?.pendingClaim ? (
            <SaleButtons tokenId={tokenId} reclaim={!token?.pendingClaim} />
        ) : token?.activeLoan && token.type === 'nugg' ? (
            <LoanButtons tokenId={token.tokenId} />
        ) : (
            <OwnerButtons tokenId={token.tokenId} />
        )
    ) : null;
};

export default MyNuggActions;
