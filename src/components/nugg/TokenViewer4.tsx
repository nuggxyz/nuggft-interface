import { config as springConfig, useSpring, animated } from '@react-spring/web';
import React, { CSSProperties, FunctionComponent } from 'react';

import { TextProps } from '@src/components/general/Texts/Text/Text';
import { useDotnuggCacheOnlyLazy } from '@src/client/hooks/useDotnugg';

import DangerouslySetNugg from './DangerouslySetNugg';

export type TokenViewerProps = {
	tokenId?: TokenId;
	style?: CSSProperties;
	showLabel?: boolean;
	labelColor?: string;
	textProps?: Omit<TextProps, 'children'>;
	svgNotFromGraph?: Base64EncodedSvg | null | undefined;
	showcase?: boolean;
	labelLong?: boolean;
	disableOnClick?: boolean;
	checkForUpdates?: boolean;
	showPending?: boolean;
	subscribe?: boolean;
	updateCache?: boolean;
	morphing?: boolean;
	shouldLoad?: boolean;
	forceCache?: boolean;
	tokenStyle?: CSSProperties;
};

const TokenViewer4: FunctionComponent<TokenViewerProps> = ({
	tokenId,
	shouldLoad = true,
	forceCache = false,
	tokenStyle,
}) => {
	const [src] = useDotnuggCacheOnlyLazy(shouldLoad, tokenId, forceCache);

	const [animatedStyle] = useSpring(
		(a: typeof src, p: typeof shouldLoad) => ({
			from: {
				opacity: 0,
			},
			to: {
				opacity: a === undefined || p === false ? 0 : 1,
			},
			config: springConfig.gentle,
		}),
		[src, shouldLoad],
	);

	return (
		<animated.div
			style={{
				position: 'relative' as const,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'column' as const,
				zIndex: 101,
				...animatedStyle,
			}}
		>
			<div role="presentation" style={{ width: '275px', height: '275px', ...tokenStyle }}>
				<DangerouslySetNugg imageUri={src} size="showcase" />
			</div>
		</animated.div>
	);
};

export default React.memo(TokenViewer4, (prev, props) => {
	const a = prev.tokenId === props.tokenId && prev.svgNotFromGraph === props.svgNotFromGraph;
	return a;
});
