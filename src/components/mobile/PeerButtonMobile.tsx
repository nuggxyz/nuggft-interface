import React, { CSSProperties } from 'react';
import { BsCheck2All } from 'react-icons/bs';

import Text from '@src/components/general/Texts/Text/Text';
import lib from '@src/lib';
import web3 from '@src/web3';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import Loader from '@src/components/general/Loader/Loader';

const Img = ({
	src,
	height = 75,
	width = 75,
	style = {
		borderRadius: '22.5%',
		objectFit: 'cover',
	},
}: {
	src: string;
	height?: number;
	width?: number;
	style?: CSSProperties;
}) => {
	return React.createElement('img', { src, height, width, style });
};

const PeerButtonMobile = React.memo<{
	text?: string;
	color?: string;
	onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	loading?: boolean;
	disabled?: boolean;
	done?: boolean;
	ok?: boolean;
	fee?: PairInt;
	icon?: string;
	header?: string;
	style?: CSSProperties;
	className?: string;
}>(
	({
		text,
		color = lib.colors.primaryColor,
		onClick,
		loading,
		disabled,
		ok = true,
		fee,
		done,
		icon,
		header,
		style,
		className,
	}) => {
		const priorityPeer = web3.hook.usePriorityPeer();

		return (
			<div
				className={className || 'mobile-pressable-div'}
				style={{
					background: color,
					color: 'white',
					borderRadius: lib.layout.borderRadius.largish,
					boxShadow: lib.layout.boxShadow.dark,
					// width: 'auto',
					display: 'flex',
					padding: 10,
					alignItems: 'center',
					...((disabled || !ok) && {
						opacity: 0.6,
						cursor: 'not-allowed',
					}),
					position: 'relative',
					...style,
				}}
				onClick={onClick}
				aria-hidden="true"
				role="button"
			>
				{priorityPeer && <Img src={icon ?? priorityPeer?.icon} />}
				<div
					style={{
						display: 'flex',
						alignItems: 'left',
						flexDirection: 'column',
						// width: '100%',
						marginLeft: 10,
					}}
				>
					{!fee ? (
						<Text textStyle={{ color: lib.colors.white, fontSize: 20 }}>{text}</Text>
					) : (
						<CurrencyText
							value={fee}
							textStyle={{ color: lib.colors.white, fontSize: 20 }}
						/>
					)}

					<Text
						textStyle={{
							color: lib.colors.white,
							fontSize: 30,
						}}
					>
						{header ?? priorityPeer?.name}
					</Text>

					{done ? (
						<BsCheck2All />
					) : loading ? (
						<Loader style={{}} color={lib.colors.transparentWhite} diameter={30} />
					) : null}
				</div>
			</div>
		);
	},
);

export default PeerButtonMobile;
