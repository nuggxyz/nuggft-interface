import React, { CSSProperties, FunctionComponent, useMemo } from 'react';

import metamask_icon from '@src/assets/images/app_icons/metamask.webp';
import cryptodotcom_icon from '@src/assets/images/app_icons/cryptodotcom.webp';
import ledgerlive_icon from '@src/assets/images/app_icons/ledger.webp';
import coinbase_icon from '@src/assets/images/app_icons/coinbase.webp';
import coinbasewallet_icon from '@src/assets/images/app_icons/coinbasewallet.webp';
import rainbow_icon from '@src/assets/images/app_icons/rainbow.webp';
import trust_icon from '@src/assets/images/app_icons/trust.webp';
import walletconnect_icon from '@src/assets/images/app_icons/walletconnect.webp';
/// //////////////////////////////////////////////////////////////////
import eth from '@src/assets/images/currency/eth.svg';
import metamask from '@src/assets/images/app_logos/metamask.png';
import walletconnect from '@src/assets/images/app_logos/walletconnect.png';
import nugg from '@src/assets/images/nugg/nugg-white.png';
import nuggbutton from '@src/assets/images/nugg/nuggbutton.png';
import coinbasewallet from '@src/assets/images/app_logos/coinbasewallet.png';
import coinbase from '@src/assets/images/app_logos/coinbase.png';
import rainbow from '@src/assets/images/app_logos/rainbow.png';
import trust from '@src/assets/images/app_logos/trust.svg';
import ledger from '@src/assets/images/app_logos/ledger.svg';
import cryptodotcom from '@src/assets/images/app_logos/cryptodotcom.png';
import graph from '@src/assets/images/app_logos/graph.png';
import { Peer } from '@src/web3/core/interfaces';

type Images = Peer | 'graph';

export type NLStaticImageKey =
	| 'nuggbutton'
	| 'nugg'
	| 'eth'
	| Images
	| `${Images}_icon`
	| `${Images}_icon_small`;

type Props = {
	image: NLStaticImageKey;
	style?: CSSProperties;
};

const StaticAppIcon: FunctionComponent<Props & { icon: string }> = ({ image, style, icon }) => {
	return (
		<img
			src={icon}
			height={50}
			width={50}
			alt={image}
			style={{
				borderRadius: '22.5%',
				objectFit: 'cover',
				...style,
			}}
		/>
	);
};

const StaticAppIconSmall: FunctionComponent<Props & { icon: string }> = ({
	image,
	style,
	icon,
}) => {
	return (
		<img
			src={icon}
			height={19}
			width={19}
			alt={image}
			style={{
				borderRadius: '22.5%',
				objectFit: 'cover',
				...style,
			}}
		/>
	);
};

const NLStaticImage: FunctionComponent<Props> = (props) => {
	const img = useMemo(() => {
		switch (props.image) {
			case 'metamask_icon':
				return StaticAppIcon({ ...props, icon: metamask_icon });
			case 'cryptodotcom_icon':
				return StaticAppIcon({ ...props, icon: cryptodotcom_icon });
			case 'ledgerlive_icon':
				return StaticAppIcon({ ...props, icon: ledgerlive_icon });
			case 'coinbase_icon':
				return StaticAppIcon({ ...props, icon: coinbase_icon });
			case 'coinbasewallet_icon':
				return StaticAppIcon({ ...props, icon: coinbasewallet_icon });
			case 'rainbow_icon':
				return StaticAppIcon({ ...props, icon: rainbow_icon });
			case 'walletconnect_icon':
				return StaticAppIcon({ ...props, icon: walletconnect_icon });
			case 'trust_icon':
				return StaticAppIcon({ ...props, icon: trust_icon });
			case 'metamask_icon_small':
				return StaticAppIconSmall({ ...props, icon: metamask_icon });
			case 'cryptodotcom_icon_small':
				return StaticAppIconSmall({ ...props, icon: cryptodotcom_icon });
			case 'ledgerlive_icon_small':
				return StaticAppIconSmall({ ...props, icon: ledgerlive_icon });
			case 'coinbase_icon_small':
				return StaticAppIconSmall({ ...props, icon: coinbase_icon });
			case 'coinbasewallet_icon_small':
				return StaticAppIconSmall({ ...props, icon: coinbasewallet_icon });
			case 'rainbow_icon_small':
				return StaticAppIconSmall({ ...props, icon: rainbow_icon });
			case 'walletconnect_icon_small':
				return StaticAppIconSmall({ ...props, icon: walletconnect_icon });
			case 'trust_icon_small':
				return StaticAppIconSmall({ ...props, icon: trust_icon });
			case 'metamask':
				return (
					<img
						src={metamask}
						alt={props.image}
						height={48}
						width={128}
						style={{ objectFit: 'contain', height: 23.8, ...props.style }}
					/>
				);

			case 'walletconnect':
				return (
					<img
						src={walletconnect}
						alt={props.image}
						height={48}
						width={128}
						style={{ objectFit: 'contain', height: 23.8, ...props.style }}
					/>
				);
			case 'eth':
				return (
					<img src={eth} height={20} width={20} style={props.style} alt={props.image} />
				);
			case 'nugg':
				return (
					<img src={nugg} height={35} width={35} style={props.style} alt={props.image} />
				);
			case 'nuggbutton':
				return (
					<img
						src={nuggbutton}
						height={55}
						width={110}
						style={{ objectFit: 'contain', ...props.style }}
						alt={props.image}
					/>
				);
			case 'coinbasewallet':
				return (
					<img
						src={coinbasewallet}
						height={48}
						width={128}
						style={{ objectFit: 'contain', height: 23.8, ...props.style }}
						alt={props.image}
					/>
				);
			case 'coinbase':
				return (
					<img
						src={coinbase}
						height={48}
						width={128}
						style={{ objectFit: 'contain', height: 23.8, ...props.style }}
						alt={props.image}
					/>
				);
			case 'rainbow':
				return (
					<img
						src={rainbow}
						height={48}
						width={128}
						style={{ objectFit: 'contain', height: 23.8, ...props.style }}
						alt={props.image}
					/>
				);
			case 'trust':
				return (
					<img
						src={trust}
						width={170}
						style={{ objectFit: 'cover', height: 23.8, ...props.style }}
						alt={props.image}
					/>
				);
			case 'ledgerlive':
				return (
					<img
						src={ledger}
						height={120}
						width={100}
						style={{ objectFit: 'contain', height: 23.8, ...props.style }}
						alt={props.image}
					/>
				);
			case 'cryptodotcom':
				return (
					<img
						src={cryptodotcom}
						height={48}
						width={128}
						style={{ objectFit: 'contain', height: 23.8, ...props.style }}
						alt={props.image}
					/>
				);
			case 'graph':
				return (
					<img
						src={graph}
						height={48}
						width={128}
						style={{ objectFit: 'contain', height: 23.8, ...props.style }}
						alt={props.image}
					/>
				);
			default:
				return null;
		}
	}, [props]);
	return img;
};

export default React.memo(NLStaticImage);
