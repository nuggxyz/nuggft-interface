import React, { CSSProperties } from 'react';
import { IoInformationCircle } from 'react-icons/io5';

import { Page } from '@src/interfaces/nuggbook';
import client from '@src/client';
import Button from '@src/components/general/Buttons/Button/Button';

export default ({
	to,
	style,
	text,
	size = 35,
	color = 'rgba(255,255,255, .8)',
	iconDropShadow,
	buttonStyle,
}: {
	to?: Page;
	color?: string;
	style?: CSSProperties;
	buttonStyle?: CSSProperties;
	text?: string;
	size?: number;
	iconDropShadow?: string;
}) => {
	const toggle = client.nuggbook.useToggle();

	return (
		<Button
			onClick={(event) => {
				event?.stopPropagation();
				toggle(to);
			}}
			leftIcon={
				<IoInformationCircle
					size={size}
					color={color}
					className="info-clicker"
					style={{ marginRight: '3px', ...style }}
				/>
			}
			className="mobile-pressable-div"
			label={text}
			hoverStyle={{ filter: 'brightness(1)' }}
			buttonStyle={{
				background: 'transparent',
				pointerEvents: 'auto',

				...(iconDropShadow && {
					'--info-clicker-filter': `drop-shadow(${iconDropShadow})`,
				}),
				...buttonStyle,
			}}
			textStyle={{ color }}
			size="small"
		/>
		// <div
		//     className="mobile-pressable-div"
		//     onClick={() => openNuggBook(to)}
		// style={{display:}}
		//     // divStyle={{ padding: 0, borderRadius: 0 }}
		//     aria-hidden="true"
		// >

		// </div>
	);
};

/// auctions
/// about the items
/// balance
