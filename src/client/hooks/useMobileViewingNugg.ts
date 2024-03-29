import React from 'react';
import { useNavigate, useMatch } from 'react-router-dom';

import useDimensions from '@src/client/hooks/useDimensions';

export default () => {
	const navigate = useNavigate();

	const goto = React.useCallback(
		(tokenId: TokenId) => {
			navigate(`/swap/${tokenId}`);
		},
		[navigate],
	);

	const tokenId = useMatch(`/swap/:tokenId`);

	const [, isPhone] = useDimensions();

	const show = React.useMemo(() => {
		return !!tokenId?.params.tokenId && isPhone;
	}, [tokenId, isPhone]);

	return {
		goto,
		tokenId: tokenId?.params.tokenId as TokenId | undefined,
		show,
	};
};
