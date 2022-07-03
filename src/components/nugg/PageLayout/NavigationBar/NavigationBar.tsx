import React, { FC, useCallback } from 'react';
import { animated } from '@react-spring/web';
import { useMatch, useNavigate } from 'react-router-dom';

import AccountViewer from '@src/components/nugg/AccountViewer/AccountViewer';
import FloorPrice from '@src/components/nugg/FloorPrice';
import NuggDexSearchBar from '@src/components/nugg/NuggDex/NuggDexSearchBar/NuggDexSearchBar';
import HealthIndicator from '@src/components/general/Buttons/HealthIndicator/HealthIndicator';
// import useBlur from '@src/hooks/useBlur';
import useDimensions from '@src/client/hooks/useDimensions';
import ChainIndicator from '@src/components/general/Buttons/ChainIndicator/ChainIndicator';
import lib from '@src/lib';

import styles from './NavigationBar.styles';

type Props = {
	showBackButton?: boolean;
};

const NavigationBar: FC<Props> = () => {
	const [screenType] = useDimensions();

	const navigate = useNavigate();

	const isViewOpen = useMatch('/view/*');
	const isHome = useMatch('swap/:id');

	const onClick = useCallback(() => {
		if (!isHome?.params.id) navigate('/');
	}, [isHome, navigate]);

	// const container = useBlur([]);

	// const openNuggBook = client.nuggbook.useOpenNuggBook();

	return (
		<animated.div
			style={{
				...styles.navBarContainer,
				// ...container,
				...(isHome
					? {
							backdropFilter: 'blur(1px)',
							WebkitBackdropFilter: 'blur(1px)',
					  }
					: {}),
			}}
		>
			<div
				role="button"
				aria-hidden="true"
				style={{ ...styles.navBarBackground }}
				onClick={onClick}
			/>
			<div
				style={{
					...styles.searchBarContainer,
				}}
			>
				<NuggDexSearchBar />
			</div>

			<div
				style={{
					whiteSpace: 'nowrap',
					position: 'relative',
					display: 'flex',
					alignItems: 'center',
				}}
			>
				<div
					style={{
						left: '-3.2rem',
						position: 'absolute',
						...(isViewOpen && { filter: 'blur(10px)' }),
						transition: `all .5s ${lib.layout.animation}`,
					}}
				>
					<HealthIndicator />
				</div>
				<ChainIndicator />
				{screenType === 'tablet' && (
					<div
						style={{
							position: 'absolute',
							marginTop: '0rem',
							width: '100%',
						}}
					>
						<FloorPrice />
					</div>
				)}
			</div>

			<div
				style={{
					...styles.linkAccountContainer,
					justifyContent: screenType === 'desktop' ? 'space-between' : 'flex-end',
				}}
			>
				{screenType === 'desktop' && <FloorPrice />}

				<AccountViewer />
			</div>
		</animated.div>
	);
};

export default React.memo(NavigationBar);
