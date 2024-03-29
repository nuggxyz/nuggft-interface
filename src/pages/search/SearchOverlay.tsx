import { animated } from '@react-spring/web';
import React, { FunctionComponent } from 'react';
import { useMatch, useNavigate } from 'react-router-dom';

import NuggDexSearchList from '@src/components/nugg/NuggDex/NuggDexSearchList/NuggDexSearchList';
import ViewingNugg from '@src/components/nugg/ViewingNugg/ViewingNugg';
import client from '@src/client';
import lib from '@src/lib';
import useAnimateOverlay from '@src/hooks/useAnimateOverlay';
import { useOverlayRouteStyle } from '@src/lib/router';

type Props = Record<string, never>;

const styles = lib.layout.NLStyleSheetCreator({
	container: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'space-between',
		zIndex: 997,
		// backdropFilter: 'blur(10)',
	},
	nuggDexContainer: {
		display: 'flex',
		width: '50%',
		maxWidth: '100vh',
		height: '100%',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	tokenContainer: {
		display: 'flex',
		width: '50%',
		maxWidth: '100vh',
		height: '100%',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
	},
});

const SearchOverlay: FunctionComponent<Props> = () => {
	const isPageLoaded = client.live.pageIsLoaded();

	const setPageIsLoaded = client.mutate.setPageIsLoaded();

	const navigate = useNavigate();
	const lastSwap = client.live.lastSwap.tokenId();

	const visible = useMatch('/view/*');

	// this slows the rendering to a normal timeframe depending on how the user gets here
	// if the SearchOverlay was viewable from the beggining, we go ahead and render everything (setPageIsLoaded to true with no timeout)
	// if this is not the case, we delay the render by 500ms to reduce the lurching in
	const [wasNotVisible] = React.useState(visible === null);

	React.useEffect(() => {
		if (!isPageLoaded && visible) setTimeout(() => setPageIsLoaded(), wasNotVisible ? 500 : 0);
	}, [visible, isPageLoaded, setPageIsLoaded, wasNotVisible]);

	// const blur = useBlur(['/view/*']);
	const style: CSSPropertiesAnimated = useAnimateOverlay(!!visible);

	const overlay = useOverlayRouteStyle();

	return (
		<animated.div
			style={{
				...overlay,
				// ...blur,
				...style,
				...styles.container,
			}}
			onClick={() => {
				if (visible) {
					if (lastSwap) navigate(`/swap/${lastSwap}`);
					else navigate('/');
				}
			}}
		>
			<div
				aria-hidden="true"
				role="button"
				style={{
					...styles.nuggDexContainer,
					width: '50%',
					maxWidth: '100vh',
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<NuggDexSearchList />
			</div>
			<div
				aria-hidden="true"
				role="button"
				style={{
					...styles.tokenContainer,
					width: '50%',
					maxWidth: '100vh',
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<ViewingNugg />
			</div>
		</animated.div>
	);
};

export default React.memo(SearchOverlay);
