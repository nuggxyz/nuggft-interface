import React, { FC, useRef } from 'react';
import { animated, config, useSpring } from '@react-spring/web';

import lib from '@src/lib';
import useOnClickOutside from '@src/hooks/useOnClickOutside';
import useAnimateOverlay from '@src/hooks/useAnimateOverlay';
import client from '@src/client';
import useDimensions from '@src/client/hooks/useDimensions';
import { ModalEnum } from '@src/interfaces/modals';

import LoanInputModal from './LoanInputModal/LoanInputModal';
import LoanOrBurnModal from './LoanOrBurnModal/LoanOrBurnModal';
import OfferModal from './OfferModal/OfferModal';
import QrCodeModal from './QrCodeModal/QrCodeModal';
import SellNuggOrItemModal from './SellNuggOrItemModal/SellNuggOrItemModal';
import NuggBookModal from './NuggBookModal/NuggBookModal';

export const ModalSwitch = () => {
	const data = client.modal.useData();

	switch (data?.modalType) {
		case ModalEnum.Offer:
			return <OfferModal data={data} />;
		case ModalEnum.Sell:
			return <SellNuggOrItemModal data={data} />;

		case ModalEnum.QrCode:
			return <QrCodeModal data={data} />;

		case ModalEnum.LoanInput:
			return <LoanInputModal data={data} />;
		case ModalEnum.Loan:
			return <LoanOrBurnModal data={data} />;
		case ModalEnum.NuggBook:
			return <NuggBookModal />;
		case undefined:
		default:
			return null;
	}
};

const Modal: FC<unknown> = () => {
	const isOpen = client.modal.useOpen();
	const data = client.modal.useData();
	const closeModal = client.modal.useCloseModal();

	const node = useRef<HTMLDivElement>(null);

	const [screenType] = useDimensions();

	const containerStyle = useSpring({
		to: {
			...styles.container,
			...(screenType === 'phone' ? styles.containerMobile : styles.containerFull),
			// eslint-disable-next-line no-nested-ternary
			transform: isOpen
				? screenType === 'phone'
					? 'translate(0px, 18px)'
					: 'translate(8px, 8px)'
				: 'translate(36px, 36px)',
		},
		config: config.default,
	});
	const containerBackgroundStyle = useSpring({
		to: {
			...styles.containerBackground,
			transform: isOpen ? 'translate(-4px, -4px)' : 'translate(-24px, -24px)',
			...(screenType === 'phone' ? styles.containerMobile : styles.containerFull),
		},
		config: config.default,
	});

	const style: CSSPropertiesAnimated = useAnimateOverlay(isOpen, { zIndex: 999000 });

	useOnClickOutside(node, closeModal);

	return (
		<animated.div style={{ ...style }}>
			<div
				style={{
					position: 'relative',
					...(screenType === 'phone' && {
						width: '100%',
						display: 'flex',
						justifyContent: 'center',
						// marginTop: '150px',
					}),
				}}
			>
				<animated.div
					style={{
						...containerBackgroundStyle,
						...data?.backgroundStyle,
						display: screenType !== 'phone' ? 'auto' : 'none',
					}}
				/>
				<animated.div style={{ ...containerStyle, ...data?.containerStyle }} ref={node}>
					<ModalSwitch />
				</animated.div>
			</div>
		</animated.div>
	);
};

const styles = lib.layout.NLStyleSheetCreator({
	wrapper: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',

		background: 'transparent',
		transition: `opacity .5s ${lib.layout.animation}`,
		backdropFilter: 'blur(10px)',
		WebkitBackdropFilter: 'blur(10px)',
		zIndex: 99900000,
	},
	open: {
		opacity: 1,
		background: lib.colors.transparentGrey,
		zIndex: 99900000,
		overflow: 'hidden',
	},
	closed: {
		opacity: 0,
		background: 'transparent',
	},
	container: {
		background: lib.colors.semiTransparentWhite,
		backdropFilter: 'blur(20px)',
		// commented out to fix issue #64
		// WebkitBackdropFilter: 'blur(20px)',
		transition: `.2s all ${lib.layout.animation}`,
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'center',
		position: 'relative',
		borderRadius: lib.layout.borderRadius.largish,
		padding: '1rem',
		width: '100%',
		transform: 'translate(1.5rem, 1.5rem)',
	},
	containerFull: { width: '630px' },
	containerMobile: {
		width: '90%',
		maxHeight: '100%',
		margin: '0rem',
		// margin: '0rem .5rem',
		transform: 'translate(0rem, 0rem)',
		justifyContent: 'flex-start',
		backdropFilter: 'blur(10px)',
		WebkitBackdropFilter: 'blur(10px)',
		minWidth: '0px',
	},
	containerOpen: {
		transform: 'translate(.5rem, .5rem)',
	},
	containerBackground: {
		position: 'absolute',
		background: lib.colors.gradient2Transparent,
		transition: `.2s all ${lib.layout.animation}`,
		opacity: 1,
		width: '100%',
		padding: '1rem',
		height: '100%',
		borderRadius: lib.layout.borderRadius.largish,
	},
	containerBackgroundOpen: { transform: 'translate(-.2rem, -.2rem)' },
	closeButton: {
		position: 'absolute',
		top: 0,
		right: 0,
	},
});

export default React.memo(Modal);
