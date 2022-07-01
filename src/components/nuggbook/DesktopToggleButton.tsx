import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { animated, config, useSpring, useTransition } from '@react-spring/web';
import { IoInformation } from 'react-icons/io5';

import client from '@src/client';
import useDimensions from '@src/client/hooks/useDimensions';
import { ModalEnum } from '@src/interfaces/modals';
import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import { Page } from '@src/interfaces/nuggbook';

type Props = Record<string, never>;

const DesktopToggleButton: FunctionComponent<Props> = () => {
	const [, , { height }] = useDimensions();
	const openModal = client.modal.useOpenModal();
	const openNuggbook = useCallback(() => {
		openModal({
			modalType: ModalEnum.NuggBook,
			containerStyle: {
				padding: '0rem',
				height: height / 1.5,
				background: lib.colors.transparentWhite,
				overflow: 'scroll',
			},
		});
	}, [openModal, height]);
	const close = client.nuggbook.useCloseNuggBook();
	const setPage = client.nuggbook.useOpenNuggBook();
	const visits = client.nuggbook.useVisits();
	const setVisits = client.nuggbook.useSetVisit();

	const [isOpen, setIsOpen] = useState(false);

	const animation = useTransition(isOpen, {
		from: {
			pointerEvents: 'none' as const,
			opacity: 0,
			y: 15,
			x: 0,
		},
		enter: { opacity: 1, pointerEvents: 'auto' as const, y: 0, x: -60 },
		leave: { opacity: 0, pointerEvents: 'none' as const, y: 15, x: 0 },
		config: config.stiff,
	});

	const [{ x }, api] = useSpring(() => ({
		from: { x: 0 },
		x: 1,
		config: { duration: 1500 },
	}));

	useEffect(() => {
		if (isOpen) {
			const id = setInterval(() => {
				api.start({ x: x.get() === 0 ? 1 : 0 });
			}, 5000);
			return () => clearInterval(id);
		}
		return undefined;
	}, [isOpen, api]);

	useEffect(() => {
		if (!visits[Page.Start]) {
			setTimeout(() => setIsOpen(true), 2000);
		}
	}, [visits]);
	return (
		<>
			<Button
				buttonStyle={{
					position: 'absolute',
					bottom: '1rem',
					right: '1rem',
					background: lib.colors.nuggBlueTransparent,
					borderRadius: lib.layout.borderRadius.large,
					padding: '.5rem',
				}}
				rightIcon={<IoInformation color={lib.colors.nuggBlueText} size={25} />}
				onClick={() => {
					openNuggbook();
					setIsOpen(false);
				}}
			/>
			{animation((style, _isOpen) =>
				_isOpen ? (
					<animated.div
						style={{
							...style,
							justifyContent: 'flex-start',
							alignItems: 'center',
							display: 'flex',
							flexDirection: 'column',
							position: 'absolute',
							bottom: '1rem',
							right: '1rem',
							width: '300px',
							// height: '200px',
							zIndex: 1000,
							background: lib.colors.white,
							borderRadius: lib.layout.borderRadius.largish,
							boxShadow: lib.layout.boxShadow.basic,
							padding: '.5rem',
							scale: x.to({
								range: [0, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 1],
								output: [1, 0.97, 0.9, 1.1, 0.9, 1.1, 1.03, 1],
							}),
						}}
					>
						<div
							style={{
								justifyContent: 'space-between',
								alignItems: 'center',
								display: 'flex',
								width: '100%',
								marginBottom: '1rem',
							}}
						>
							<Text size="larger" textStyle={{ marginLeft: '.5rem' }}>
								New here?
							</Text>
							<Button
								className="mobile-pressable-div"
								label="nah"
								size="medium"
								buttonStyle={{
									background: lib.colors.gradient,
									color: 'white',
									borderRadius: lib.layout.borderRadius.large,
									marginBottom: '.4rem',

									backgroundColor: lib.colors.white,
									boxShadow: lib.layout.boxShadow.basic,

									// width: '5rem',
								}}
								onClick={() => {
									setVisits(Page.Start);
									setIsOpen(false);
									close();
								}}
							/>
						</div>
						<Button
							className="mobile-pressable-div"
							size="large"
							buttonStyle={{
								background: lib.colors.gradient2,
								color: 'white',
								borderRadius: lib.layout.borderRadius.large,
								backgroundColor: lib.colors.white,
								boxShadow: lib.layout.boxShadow.basic,
								width: '100%',
							}}
							label="give me the rundown"
							onClick={() => {
								openNuggbook();
								setVisits(Page.Start);
								setIsOpen(false);
								setPage(Page.Welcome);
							}}
						/>
					</animated.div>
				) : null,
			)}
		</>
	);
};

export default DesktopToggleButton;
