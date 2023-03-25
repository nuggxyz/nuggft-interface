import React, { FC } from 'react';
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
import useBlur from '@src/hooks/useBlur';
import Button from '@src/components/general/Buttons/Button/Button';
import { IoClose } from 'react-icons/io5';
import useAnimateOpacity from '@src/hooks/useAnimateOpacity';

type Props = {
	showBackButton?: boolean;
};

const NavigationBar: FC<Props> = () => {
	const navigate = useNavigate();
	const isView = useMatch({ path: 'view', end: false });
	const blur = useBlur(['live', 'swap/:id']);
	const epoch = client.epoch.active.useId();
	const buttonStyle = useAnimateOpacity(!!isView, {
		position: 'absolute',
		padding: '.4rem',
		background: lib.colors.nuggRedSemiTransparent,
		borderRadius: '100px',
		color: 'white',
		right: '4%',
		boxShadow: lib.layout.boxShadow.basic,
	});
	return (
		<animated.div
			style={{
				...styles.navBarContainer,
			}}
		>
			<div role="button" aria-hidden="true" style={{ ...styles.navBarBackground }} />
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
				<animated.div style={blur}>
					<AccountViewer />
				</animated.div>
			</div>
			<Button
				onClick={() => navigate('/')}
				buttonStyle={buttonStyle}
				rightIcon={<IoClose size={30} />}
			/>
		</animated.div>
	);
};

export default React.memo(NavigationBar);
