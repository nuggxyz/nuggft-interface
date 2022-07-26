import React from 'react';

import client from '@src/client';
import Text from '@src/components/general/Texts/Text/Text';
import lib from '@src/lib';
import { Page } from '@src/interfaces/nuggbook';

export const GraphWarning = () => {
	const graphProblem = client.health.useHealth();
	const lastGraphBlockTimestamp = client.health.useLastGraphBlockTimestamp();
	return (
		<>
			{graphProblem ? (
				<Text
					textStyle={{
						padding: '0.5rem 0.5rem',
						background: lib.colors.gradientTransparent,
						borderRadius: lib.layout.borderRadius.medium,
					}}
				>
					⚠️ from{' '}
					{Math.floor((new Date().getTime() - lastGraphBlockTimestamp) / 60 / 1000)} min
					ago
				</Text>
			) : (
				<div />
			)}
		</>
	);
};

export const GraphWarningSmall = () => {
	const graphProblem = client.health.useHealth();

	const openNuggbook = client.nuggbook.useGotoOpen();
	return (
		<>
			{graphProblem ? (
				<div
					className="mobile-pressable-div"
					aria-hidden="true"
					role="button"
					onClick={() => openNuggbook(Page.Status)}
					style={{
						padding: '6px 12px',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: lib.colors.gradientTransparent,
						borderRadius: lib.layout.borderRadius.medium,
						boxShadow: lib.layout.boxShadow.basic,
					}}
				>
					<span>🕓</span>
				</div>
			) : (
				<div />
			)}
		</>
	);
};
