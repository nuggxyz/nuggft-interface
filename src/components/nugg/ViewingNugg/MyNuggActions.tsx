import React, { FunctionComponent } from 'react';

import client from '@src/client';

import LoanButtons from './FlyoutButtons/LoanButtons';
import OwnerButtons from './FlyoutButtons/OwnerButtons';
import SaleButtons from './FlyoutButtons/SaleButtons';

type Props = Record<string, never>;

const MyNuggActions: FunctionComponent<Props> = () => {
    const tokenId = client.live.lastView.tokenId();
    const token = client.live.token(tokenId);

    return tokenId && token && token.type === 'nugg' ? (
        token?.activeSwap?.id || token?.pendingClaim ? (
            <SaleButtons tokenId={tokenId} reclaim={!token?.pendingClaim} />
        ) : token?.activeLoan ? (
            <LoanButtons tokenId={tokenId} />
        ) : (
            <OwnerButtons tokenId={tokenId} />
        )
    ) : null;
};

export default MyNuggActions;
