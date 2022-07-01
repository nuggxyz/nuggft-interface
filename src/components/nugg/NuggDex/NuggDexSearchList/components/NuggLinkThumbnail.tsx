import React, { CSSProperties, FunctionComponent, useMemo } from 'react';
import { animated } from '@react-spring/web';

import useOnHover from '@src/hooks/useOnHover';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import useDimensions from '@src/client/hooks/useDimensions';
import useViewingNugg from '@src/client/hooks/useViewingNugg';
import useMobileViewingNugg from '@src/client/hooks/useMobileViewingNugg';

import styles from './NuggDexComponents.styles';

const NuggLinkThumbnail: FunctionComponent<{
	tokenId: TokenId;
	index: number;
	style?: CSSProperties;
}> = ({ tokenId, index, style: customStyle }) => {
	const [ref, isHovering] = useOnHover();

	const style = useMemo(() => {
		return {
			...styles.nuggLinkThumbnailContainer,
			...(isHovering ? styles.hover : {}),
			// ...(lastView__tokenId === tokenId.tokenId ? styles.selected : {}),
			...customStyle,
		};
	}, [tokenId, isHovering, customStyle]);
	const [screenType, isPhone] = useDimensions();

	const { gotoViewingNugg } = useViewingNugg();
	const { goto } = useMobileViewingNugg();

	const onClick = React.useCallback(
		(item: TokenId) => {
			if (isPhone) goto(item);
			else gotoViewingNugg(item);
		},
		[gotoViewingNugg, goto, isPhone],
	);

	return (
		<animated.div
			ref={ref}
			key={index}
			style={{ ...style }}
			onClick={() => {
				onClick(tokenId);
			}}
		>
			<TokenViewer
				tokenId={tokenId}
				style={styles.nugg}
				disableOnClick
				// shouldLoad={pageLoaded}
			/>
			{screenType !== 'phone' && (
				<Text size="smaller" textStyle={styles.label}>
					{tokenId.toPrettyId()}
				</Text>
			)}
		</animated.div>
	);
};

export default React.memo(NuggLinkThumbnail);
