import React from 'react';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import useDimensions from '@src/client/hooks/useDimensions';
import useInterval from '@src/hooks/useInterval';
import client from '@src/client';
import TheRingLight from '@src/components/nugg/TheRing/TheRingLight';
import packages from '@src/packages';

const Tldr_6: NuggBookPage = ({ setPage }) => {
	const epoch = client.epoch.active.useId();
	const token = client.live.token(epoch?.toNuggId());
	const spring4 = packages.spring.useSpring({
		from: {
			opacity: 0,
		},
		to: {
			opacity: 1,
		},
		delay: 500 + 1500 + 1 * 1000,
		config: packages.spring.config.default,
	});

	const [remaining, setRemaining] = React.useState(12);

	useInterval(
		React.useCallback(() => {
			if (remaining <= 0) setRemaining(11);
			else setRemaining(remaining - 1);
		}, [remaining]),
		1000,
	);

	const [screen] = useDimensions();

	return (
		<div
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
				flexDirection: 'column',
				marginTop: 20,
				width: screen === 'phone' ? '100%' : '80%',
			}}
		>
			<TheRingLight
				circleWidth={800}
				circleStyle={{ height: '325px' }}
				disableHover
				strokeWidth={3}
				disableClick
				manualTokenId={token?.items[4].tokenId || 'item-1001'}
				// defaultColor={dynamicTextColor}
				tokenStyle={{ width: '200px', height: '200px' }}
			/>

			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					position: 'relative',
					borderRadius: lib.layout.borderRadius.large,
					padding: '.4rem 1rem .8rem',
					textAlign: 'center',
					verticalAlign: 'center',
					marginTop: 10,
					backgroundColor: 'transparent',
				}}
			>
				<span
					style={{
						color: lib.colors.transparentPrimaryColor,
						...lib.layout.presets.font.main.semibold,
						fontWeight: lib.layout.fontWeight.thicc,
						fontSize: '25px',
					}}
				>
					{t`item auctions`}
				</span>
			</div>

			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					position: 'relative',
					borderRadius: lib.layout.borderRadius.large,
					padding: '.4rem 1rem 0px',
					textAlign: 'center',
					verticalAlign: 'center',
					marginBottom: '10px',
					backgroundColor: 'transparent',
				}}
			>
				<span
					style={{
						fontSize: '20px',
						color: lib.colors.transparentPrimaryColor,
						...lib.layout.presets.font.main.semibold,
					}}
				>
					{t`nuggs trade items the same way`}
				</span>
			</div>

			{screen !== 'phone' && (
				<packages.spring.animated.div
					className="mobile-pressable-div"
					style={{
						alignItems: 'center',
						display: 'flex',
						flexDirection: 'column',
						// padding: 10,
						color: lib.colors.white,
						boxShadow: lib.layout.boxShadow.basic,
						padding: '.7rem 1.3rem',
						background: lib.colors.gradient3,
						borderRadius: lib.layout.borderRadius.large,
						marginBottom: 15,
						zIndex: 300,
						marginTop: 15,
						...spring4,
					}}
					role="button"
					aria-hidden="true"
					onClick={() => {
						setPage(Page.Tldr_5, true);
					}}
				>
					<span style={{ ...lib.layout.presets.font.main.thicc }}>{t`next`}</span>
				</packages.spring.animated.div>
			)}
		</div>
	);
};

export default Tldr_6;
