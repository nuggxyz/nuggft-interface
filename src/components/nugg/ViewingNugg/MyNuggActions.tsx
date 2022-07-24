import React, { FunctionComponent, useMemo } from 'react';

import client from '@src/client';
import useViewingNugg from '@src/client/hooks/useViewingNugg';
import useMobileViewingNugg from '@src/client/hooks/useMobileViewingNugg';

import LoanButtons from './ActionButtons/LoanButtons';
import OwnerButtons from './ActionButtons/OwnerButtons';
import SaleButtons from './ActionButtons/SaleButtons';

type Props = Record<string, never>;

const MyNuggActions: FunctionComponent<Props> = () => {
	const { safeTokenId: regular } = useViewingNugg();
	const { tokenId: mobile } = useMobileViewingNugg();
	const tokenId = useMemo(() => regular || mobile, [regular, mobile]);
	const token = client.token.useToken(tokenId);

	return tokenId && token && token.isNugg() ? (
		token?.activeSwap?.tokenId ? (
			<SaleButtons tokenId={tokenId} reclaim={!token?.pendingClaim} />
		) : token?.activeLoan && token.type === 'nugg' ? (
			<LoanButtons tokenId={token.tokenId} />
		) : (
			<OwnerButtons tokenId={token.tokenId} />
		)
	) : null;
};

export default MyNuggActions;
