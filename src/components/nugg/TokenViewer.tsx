import { config as springConfig, useSpring, animated } from '@react-spring/web';
import React, { CSSProperties, FunctionComponent, useMemo } from 'react';

import Text, { TextProps } from '@src/components/general/Texts/Text/Text';
import useOnHover from '@src/hooks/useOnHover';
import useViewingNugg from '@src/client/hooks/useViewingNugg';
import { useDotnuggCacheOnlyLazy, useDotnuggSubscription } from '@src/client/hooks/useDotnugg';
import useDimensions from '@src/client/hooks/useDimensions';
import lib from '@src/lib';

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
};

const TokenViewer: FunctionComponent<TokenViewerProps> = ({
	tokenId,
	style,
	showLabel,
	labelColor,
	textProps,
	svgNotFromGraph,
	showcase = false,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	labelLong = false,
	disableOnClick = false,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	updateCache = false,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	subscribe = false,
	showPending = false,
	shouldLoad = true,
	forceCache = false,
}) => {
	const [screenType] = useDimensions();

	const { width } = useMemo(() => {
		return { width: window.innerWidth };
	}, []);

	const [dotnugg, isEmpty] = useDotnuggCacheOnlyLazy(shouldLoad, tokenId, forceCache);

	const triggerSubscriber = React.useMemo(() => {
		return !!(subscribe || isEmpty);
	}, [subscribe, isEmpty]);

	const dotnuggSub = useDotnuggSubscription(triggerSubscriber, tokenId);

	const src = useMemo(() => {
		return triggerSubscriber ? dotnuggSub : dotnugg;
	}, [dotnugg, dotnuggSub, triggerSubscriber]);

	const pendingSrc = usePending(svgNotFromGraph ?? src, showPending);

	const [hoverRef, isHovering] = useOnHover();

	const { gotoViewingNugg } = useViewingNugg();

	const animatedStyle = useSpring({
		from: {
			opacity: 0,
		},
		to: {
			opacity: pendingSrc || showPending ? 1 : 0,
		},
		config: springConfig.gentle,
	});

	// const strokeWidth = useDotnuggStrokeWidth(
	//     React.useMemo(() => (!showcase ? 'small' : 'large'), [showcase]),
	// );

	return (
		// @ts-ignore
		<animated.div
			style={{
				position: 'relative' as const,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				flexDirection: 'column' as const,
				...(style?.zIndex && { zIndex: style?.zIndex }),
				...animatedStyle, // transition: `opacity .5s ease`,
				// ...strokeWidth,
			}}
		>
			<div
				role="presentation"
				onClick={
					!disableOnClick
						? () => {
								if (tokenId) {
									gotoViewingNugg(tokenId);
								}
						  }
						: undefined
				}
				style={{
					...(screenType === 'phone'
						? { width: width / 1.2, height: width / 1.2 }
						: { width: '400px', height: '400px' }),
					// width: '100%',
					...style,
					// transform: 'translate3d(0,0,0)',
					...(isHovering && !disableOnClick ? { cursor: 'pointer' } : {}),
					// ...strokeWidth,
				}}
				ref={hoverRef}
			>
				<DangerouslySetNugg
					imageUri={pendingSrc}
					size={showcase ? 'showcase' : 'thumbnail'}
				/>
			</div>
			{showLabel && (
				<Text
					textStyle={{
						whiteSpace: 'nowrap',
						textAlign: 'center',
						color: labelColor || lib.colors.primaryColor,
					}}
					{...textProps}
				>
					{tokenId?.toPrettyId()}
				</Text>
			)}
		</animated.div>
	);
};

export default React.memo(TokenViewer, (prev, props) => {
	const a = prev.tokenId === props.tokenId && prev.svgNotFromGraph === props.svgNotFromGraph;
	return a;
});

const usePending = (main: null | undefined | Base64EncodedSvg, activated: boolean) => {
	// eslint-disable-next-line no-nested-ternary
	return main ?? (activated ? PENDING : undefined);
};

const PENDING = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0iIzc4ODc5Njg4IiB4bWxuczp2PSJodHRwczovL3ZlY3RhLmlvL25hbm8iPjxwYXRoIGQ9Ik0xMSA1aDEydjFIMTF6Ii8+PHBhdGggZD0iTTkgNmgydjFIOXoiLz48cGF0aCBkPSJNMTEgNmgxdjFoLTF6Ii8+PHBhdGggZD0iTTEyIDZoNHYxaC00eiIvPjxwYXRoIGQ9Ik0xNiA2aDN2MWgtM3oiLz48cGF0aCBkPSJNMTkgNmgzdjFoLTN6Ii8+PHBhdGggZD0iTTIyIDZoMnYxaC0yek05IDdoMXYxSDl6Ii8+PHBhdGggZD0iTTEwIDdoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0xMSA3aDd2MWgtN3oiLz48cGF0aCBkPSJNMTggN2gydjFoLTJ6Ii8+PHBhdGggZD0iTTIwIDdoM3YxaC0zeiIvPjxwYXRoIGQ9Ik0yMyA3aDF2MWgtMXpNOSA4aDF2MUg5eiIvPjxwYXRoIGQ9Ik0xMCA4aDJ2MWgtMnoiLz48cGF0aCBkPSJNMTIgOGgxdjFoLTF6Ii8+PHBhdGggZD0iTTEzIDhoNXYxaC01eiIvPjxwYXRoIGQ9Ik0xOCA4aDF2MWgtMXoiLz48cGF0aCBkPSJNMTkgOGgxdjFoLTF6Ii8+PHBhdGggZD0iTTIwIDhoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0yMSA4aDJ2MWgtMnoiLz48cGF0aCBkPSJNMjMgOGgxdjFoLTF6TTkgOWgxdjFIOXoiLz48cGF0aCBkPSJNMTAgOWgydjFoLTJ6Ii8+PHBhdGggZD0iTTEyIDloMXYxaC0xeiIvPjxwYXRoIGQ9Ik0xMyA5aDV2MWgtNXoiLz48cGF0aCBkPSJNMTggOWgxdjFoLTF6Ii8+PHBhdGggZD0iTTE5IDloMXYxaC0xeiIvPjxwYXRoIGQ9Ik0yMCA5aDJ2MWgtMnoiLz48cGF0aCBkPSJNMjIgOWgydjFoLTJ6Ii8+PHBhdGggZD0iTTI0IDloMXYxaC0xek04IDEwaDJ2MUg4eiIvPjxwYXRoIGQ9Ik0xMCAxMGgxdjFoLTF6Ii8+PHBhdGggZD0iTTExIDEwaDF2MWgtMXoiLz48cGF0aCBkPSJNMTIgMTBoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0xMyAxMGgxdjFoLTF6Ii8+PHBhdGggZD0iTTE0IDEwaDR2MWgtNHoiLz48cGF0aCBkPSJNMTggMTBoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0xOSAxMGgxdjFoLTF6Ii8+PHBhdGggZD0iTTIwIDEwaDF2MWgtMXoiLz48cGF0aCBkPSJNMjEgMTBoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0yMiAxMGgydjFoLTJ6Ii8+PHBhdGggZD0iTTI0IDEwaDF2MWgtMXpNOCAxMWgxdjFIOHoiLz48cGF0aCBkPSJNOSAxMWgzdjFIOXoiLz48cGF0aCBkPSJNMTIgMTFoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0xMyAxMWg2djFoLTZ6Ii8+PHBhdGggZD0iTTE5IDExaDF2MWgtMXoiLz48cGF0aCBkPSJNMjAgMTFoM3YxaC0zeiIvPjxwYXRoIGQ9Ik0yMyAxMWgxdjFoLTF6Ii8+PHBhdGggZD0iTTI0IDExaDF2MWgtMXpNOCAxMmgxdjFIOHoiLz48cGF0aCBkPSJNOSAxMmgydjFIOXoiLz48cGF0aCBkPSJNMTEgMTJoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0xMiAxMmgxdjFoLTF6Ii8+PHBhdGggZD0iTTEzIDEyaDF2MWgtMXoiLz48cGF0aCBkPSJNMTQgMTJoNHYxaC00eiIvPjxwYXRoIGQ9Ik0xOCAxMmgxdjFoLTF6Ii8+PHBhdGggZD0iTTE5IDEyaDF2MWgtMXoiLz48cGF0aCBkPSJNMjAgMTJoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0yMSAxMmgxdjFoLTF6Ii8+PHBhdGggZD0iTTIyIDEyaDJ2MWgtMnoiLz48cGF0aCBkPSJNMjQgMTJoMXYxaC0xek04IDEzaDF2MUg4eiIvPjxwYXRoIGQ9Ik05IDEzaDN2MUg5eiIvPjxwYXRoIGQ9Ik0xMiAxM2gxdjFoLTF6Ii8+PHBhdGggZD0iTTEzIDEzaDF2MWgtMXoiLz48cGF0aCBkPSJNMTQgMTNoNXYxaC01eiIvPjxwYXRoIGQ9Ik0xOSAxM2gxdjFoLTF6Ii8+PHBhdGggZD0iTTIwIDEzaDR2MWgtNHoiLz48cGF0aCBkPSJNMjQgMTNoMXYxaC0xek04IDE0aDF2MUg4eiIvPjxwYXRoIGQ9Ik05IDE0aDJ2MUg5eiIvPjxwYXRoIGQ9Ik0xMSAxNGgxdjFoLTF6Ii8+PHBhdGggZD0iTTEyIDE0aDF2MWgtMXoiLz48cGF0aCBkPSJNMTMgMTRoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0xNCAxNGg1djFoLTV6Ii8+PHBhdGggZD0iTTE5IDE0aDF2MWgtMXoiLz48cGF0aCBkPSJNMjAgMTRoNHYxaC00eiIvPjxwYXRoIGQ9Ik0yNCAxNGgxdjFoLTF6TTggMTVoMXYxSDh6Ii8+PHBhdGggZD0iTTkgMTVoNXYxSDl6Ii8+PHBhdGggZD0iTTE0IDE1aDZ2MWgtNnoiLz48cGF0aCBkPSJNMjAgMTVoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0yMSAxNWgzdjFoLTN6Ii8+PHBhdGggZD0iTTI0IDE1aDF2MWgtMXpNOCAxNmgxdjFIOHoiLz48cGF0aCBkPSJNOSAxNmg0djFIOXoiLz48cGF0aCBkPSJNMTMgMTZoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0xNCAxNmgxdjFoLTF6Ii8+PHBhdGggZD0iTTE1IDE2aDF2MWgtMXoiLz48cGF0aCBkPSJNMTYgMTZoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0xNyAxNmgxdjFoLTF6Ii8+PHBhdGggZD0iTTE4IDE2aDF2MWgtMXoiLz48cGF0aCBkPSJNMTkgMTZoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0yMCAxNmgydjFoLTJ6Ii8+PHBhdGggZD0iTTIyIDE2aDJ2MWgtMnoiLz48cGF0aCBkPSJNMjQgMTZoMXYxaC0xek04IDE3aDF2MUg4eiIvPjxwYXRoIGQ9Ik05IDE3aDR2MUg5eiIvPjxwYXRoIGQ9Ik0xMyAxN2gxdjFoLTF6Ii8+PHBhdGggZD0iTTE0IDE3aDV2MWgtNXoiLz48cGF0aCBkPSJNMTkgMTdoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0yMCAxN2gxdjFoLTF6Ii8+PHBhdGggZD0iTTIxIDE3aDN2MWgtM3oiLz48cGF0aCBkPSJNMjQgMTdoMXYxaC0xek04IDE4aDF2MUg4eiIvPjxwYXRoIGQ9Ik05IDE4aDR2MUg5eiIvPjxwYXRoIGQ9Ik0xMyAxOGgxdjFoLTF6Ii8+PHBhdGggZD0iTTE0IDE4aDF2MWgtMXoiLz48cGF0aCBkPSJNMTUgMThoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0xNiAxOGgxdjFoLTF6Ii8+PHBhdGggZD0iTTE3IDE4aDF2MWgtMXoiLz48cGF0aCBkPSJNMTggMThoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0xOSAxOGgxdjFoLTF6Ii8+PHBhdGggZD0iTTIwIDE4aDN2MWgtM3oiLz48cGF0aCBkPSJNMjMgMThoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0yNCAxOGgxdjFoLTF6TTggMTloMXYxSDh6Ii8+PHBhdGggZD0iTTkgMTloNXYxSDl6Ii8+PHBhdGggZD0iTTE0IDE5aDF2MWgtMXoiLz48cGF0aCBkPSJNMTUgMTloMXYxaC0xeiIvPjxwYXRoIGQ9Ik0xNiAxOWgxdjFoLTF6Ii8+PHBhdGggZD0iTTE3IDE5aDF2MWgtMXoiLz48cGF0aCBkPSJNMTggMTloMXYxaC0xeiIvPjxwYXRoIGQ9Ik0xOSAxOWg1djFoLTV6Ii8+PHBhdGggZD0iTTI0IDE5aDF2MWgtMXpNOSAyMGgxdjFIOXoiLz48cGF0aCBkPSJNMTAgMjBoM3YxaC0zeiIvPjxwYXRoIGQ9Ik0xMyAyMGgydjFoLTJ6Ii8+PHBhdGggZD0iTTE1IDIwaDF2MWgtMXoiLz48cGF0aCBkPSJNMTYgMjBoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0xNyAyMGgxdjFoLTF6Ii8+PHBhdGggZD0iTTE4IDIwaDZ2MWgtNnoiLz48cGF0aCBkPSJNMjQgMjBoMXYxaC0xek05IDIxaDF2MUg5eiIvPjxwYXRoIGQ9Ik0xMCAyMWg1djFoLTV6Ii8+PHBhdGggZD0iTTE1IDIxaDF2MWgtMXoiLz48cGF0aCBkPSJNMTYgMjFoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0xNyAyMWg2djFoLTZ6Ii8+PHBhdGggZD0iTTIzIDIxaDJ2MWgtMnpNOSAyMmgxdjFIOXoiLz48cGF0aCBkPSJNMTAgMjJoNXYxaC01eiIvPjxwYXRoIGQ9Ik0xNSAyMmgydjFoLTJ6Ii8+PHBhdGggZD0iTTE3IDIyaDJ2MWgtMnoiLz48cGF0aCBkPSJNMTkgMjJoNHYxaC00eiIvPjxwYXRoIGQ9Ik0yMyAyMmgxdjFoLTF6TTkgMjNoMXYxSDl6Ii8+PHBhdGggZD0iTTEwIDIzaDF2MWgtMXoiLz48cGF0aCBkPSJNMTEgMjNoNHYxaC00eiIvPjxwYXRoIGQ9Ik0xNSAyM2gxdjFoLTF6Ii8+PHBhdGggZD0iTTE2IDIzaDF2MWgtMXoiLz48cGF0aCBkPSJNMTcgMjNoNnYxaC02eiIvPjxwYXRoIGQ9Ik0yMyAyM2gxdjFoLTF6TTkgMjRoMXYxSDl6Ii8+PHBhdGggZD0iTTEwIDI0aDF2MWgtMXoiLz48cGF0aCBkPSJNMTEgMjRoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0xMiAyNGgzdjFoLTN6Ii8+PHBhdGggZD0iTTE1IDI0aDN2MWgtM3oiLz48cGF0aCBkPSJNMTggMjRoNHYxaC00eiIvPjxwYXRoIGQ9Ik0yMiAyNGgxdjFoLTF6Ii8+PHBhdGggZD0iTTIzIDI0aDF2MWgtMXpNOSAyNWgxdjFIOXoiLz48cGF0aCBkPSJNMTAgMjVoMnYxaC0yeiIvPjxwYXRoIGQ9Ik0xMiAyNWgxdjFoLTF6Ii8+PHBhdGggZD0iTTEzIDI1aDJ2MWgtMnoiLz48cGF0aCBkPSJNMTUgMjVoM3YxaC0zeiIvPjxwYXRoIGQ9Ik0xOCAyNWg0djFoLTR6Ii8+PHBhdGggZD0iTTIyIDI1aDF2MWgtMXoiLz48cGF0aCBkPSJNMjMgMjVoMXYxaC0xek05IDI2aDN2MUg5eiIvPjxwYXRoIGQ9Ik0xMiAyNmgxdjFoLTF6Ii8+PHBhdGggZD0iTTEzIDI2aDJ2MWgtMnoiLz48cGF0aCBkPSJNMTUgMjZoMnYxaC0yeiIvPjxwYXRoIGQ9Ik0xNyAyNmgzdjFoLTN6Ii8+PHBhdGggZD0iTTIwIDI2aDJ2MWgtMnoiLz48cGF0aCBkPSJNMjIgMjZoMXYxaC0xeiIvPjxwYXRoIGQ9Ik0xMSAyN2gxMXYxSDExeiIvPjwvc3ZnPgo=`;
