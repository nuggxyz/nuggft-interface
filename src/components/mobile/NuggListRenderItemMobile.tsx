import React, { FC, FunctionComponent, PropsWithChildren } from 'react';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import Label from '@src/components/general/Label/Label';
import TokenViewer from '@src/components/nugg/TokenViewer';
import {
	GodListRenderItemBig,
	GodListRenderItemSmall,
} from '@src/components/general/List/BradPittList';

type PropsBig = GodListRenderItemBig<
	TokenId,
	{ cardType: 'swap' | 'all' | 'recent' } | undefined,
	undefined
>;

export const NuggListRenderItemMobileBig: FunctionComponent<PropsBig> = ({ item }) => {
	return (
		<div
			aria-hidden="true"
			role="button"
			style={{
				width: '100%',
				display: 'flex',
				marginBottom: 10,
				justifyContent: 'space-around',
				alignItems: 'center',
				transition: `background .7s ${lib.layout.animation}`,
				position: 'relative',
			}}
		>
			<MobileContainerBig tokenId={item} />
		</div>
	);
};
type HoldingTokenId = { tokenId?: NuggId; since?: number };
type PropsBigHoldingItem = GodListRenderItemBig<
	HoldingTokenId,
	{ cardType: 'swap' | 'all' | 'recent' } | undefined,
	undefined
>;

export const NuggListRenderItemMobileBigHoldingItem: FunctionComponent<PropsBigHoldingItem> = ({
	item,
}) => {
	return (
		<div
			aria-hidden="true"
			role="button"
			style={{
				width: '100%',
				display: 'flex',
				marginBottom: 10,
				justifyContent: 'space-around',
				alignItems: 'center',
				transition: `background .7s ${lib.layout.animation}`,
				position: 'relative',
			}}
		>
			<MobileContainerBigHoldingItem tokenId={item?.tokenId} since={item?.since} />
		</div>
	);
};
type Props = GodListRenderItemSmall<
	TokenId,
	{ cardType: 'swap' | 'all' | 'recent' } | undefined,
	undefined
>;

export const NuggListRenderItemMobile: FunctionComponent<Props> = ({ item }) => {
	return (
		<div
			aria-hidden="true"
			role="button"
			style={{
				width: '100%',
				display: 'flex',
				justifyContent: 'space-around',
				alignItems: 'center',
				transition: `background .7s ${lib.layout.animation}`,
				position: 'relative',
				overflow: 'hidden',
			}}
		>
			{item && item[0] && <MobileContainer tokenId={item[0]} />}
			{item && item[1] && <MobileContainer tokenId={item[1]} />}
		</div>
	);
};

export const MobileContainer = ({ tokenId }: { tokenId?: TokenId }) => {
	return (
		<div
			className="mobile-pressable-div"
			style={{
				display: 'flex',
				alignItems: 'center',
				position: 'relative',
				width: '150px',
				height: '150px',
				flexDirection: 'column',
				justifyContent: 'center',
				background: lib.colors.transparentWhite,
				borderRadius: lib.layout.borderRadius.mediumish,
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					padding: '.3rem',
					borderRadius: lib.layout.borderRadius.large,
					position: 'absolute',
					top: '.1rem',
					right: '.1rem',
					paddingBottom: 5,
				}}
			>
				<Label
					type="text"
					size="small"
					textStyle={{
						color: lib.colors.transparentDarkGrey,
						fontSize: '10px',
						fontWeight: 'bold',
						position: 'relative',
					}}
					text={tokenId?.toPrettyId() || ''}
				/>
			</div>

			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<TokenViewer
					tokenId={tokenId}
					style={{
						height: '75px',
						width: '75px',
					}}
				/>
			</div>
		</div>
	);
};

export const MobileContainerBigHoldingItem: FC<HoldingTokenId> = ({ tokenId, since }) => {
	return (
		<MobileContainerBig tokenId={tokenId}>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					padding: '.3rem',
					borderRadius: lib.layout.borderRadius.large,
					position: 'absolute',
					bottom: '.5rem',
					paddingBottom: 5,
				}}
			>
				<Label
					// type="text"
					size="small"
					textStyle={{
						color: lib.colors.transparentDarkGrey,
						position: 'relative',
					}}
					text={t`holding since ${new Date((since || 0) * 1000).toLocaleDateString()}`}
				/>
			</div>
		</MobileContainerBig>
	);
};

export const MobileContainerBig: FC<PropsWithChildren<{ tokenId?: TokenId }>> = ({
	tokenId,
	children,
}) => {
	return (
		<div
			className="mobile-pressable-div"
			style={{
				display: 'flex',
				alignItems: 'center',
				position: 'relative',
				width: '325px',
				height: '325px',
				flexDirection: 'column',
				justifyContent: 'center',
				background: lib.colors.transparentWhite,
				borderRadius: lib.layout.borderRadius.mediumish,
			}}
		>
			{children}
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					padding: '.3rem',
					borderRadius: lib.layout.borderRadius.large,
					position: 'absolute',
					top: '.1rem',
					right: '.1rem',
					paddingBottom: 5,
				}}
			>
				<Label
					type="text"
					size="small"
					textStyle={{
						color: lib.colors.transparentDarkGrey,
						fontWeight: 'bold',
						position: 'relative',
					}}
					text={tokenId?.toPrettyId() || ''}
				/>
			</div>

			<div
				style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<TokenViewer
					tokenId={tokenId}
					style={{
						height: '250px',
						width: '250px',
					}}
				/>
			</div>
		</div>
	);
};
