import React, { FC, useCallback } from 'react';
import { animated } from '@react-spring/web';
import { useMatch, useNavigate } from 'react-router-dom';

import AccountViewer from '@src/components/nugg/AccountViewer/AccountViewer';
import FloorPrice from '@src/components/nugg/FloorPrice';
import NuggDexSearchBar from '@src/components/nugg/NuggDex/NuggDexSearchBar/NuggDexSearchBar';
import HealthIndicator from '@src/components/general/Buttons/HealthIndicator/HealthIndicator';

import styles from './NavigationBar.styles';
import client from '@src/client';
import Text from '@src/components/general/Texts/Text/Text';
import lib from '@src/lib';
import { t } from '@lingui/macro';

type Props = {
	showBackButton?: boolean;
};

const NavigationBar: FC<Props> = () => {
	const navigate = useNavigate();
	const isHome = useMatch('swap/:id');
	const epoch = client.epoch.active.useId();

	const onClick = useCallback(() => {
		if (!isHome?.params.id) navigate('/');
	}, [isHome, navigate]);

	return (
		<animated.div
			style={{
				...styles.navBarContainer,
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
					background: lib.colors.transparentWhiteSuper,
					borderRadius: lib.layout.borderRadius.large,
					paddingRight: '.8rem',
				}}
			>
				<HealthIndicator />
				<div>
					<Text size="smallest">{t`PERIOD`}</Text>
					<Text>{epoch}</Text>
				</div>
			</div>

			<div
				style={{
					...styles.linkAccountContainer,
					justifyContent: 'space-between',
				}}
			>
				<FloorPrice />

				<AccountViewer />
			</div>
		</animated.div>
	);
};

export default React.memo(NavigationBar);
