import React from 'react';
import { t } from '@lingui/macro';

import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';

const link = 'https://forms.gle/HiJ5A86LzZqYbjuN8';

export default () => {
	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Button
				buttonStyle={{
					background: lib.colors.primaryColor,
					borderRadius: lib.layout.borderRadius.large,
				}}
				textStyle={{
					color: lib.colors.white,
				}}
				label={t`goto form`}
				onClick={() => {
					window.open(link, '_');
				}}
			/>
		</div>
	);
};
