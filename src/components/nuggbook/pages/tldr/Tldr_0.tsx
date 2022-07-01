import React from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import Button from '@src/components/general/Buttons/Button/Button';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import client from '@src/client';
import useDimensions from '@src/client/hooks/useDimensions';

const layoutConfig = {
	desktop: {
		spring: '52px',
		spring2: '166px',
		spring3: '18px',
		size: 'larger' as const,
		width: '50%',
	},
	tablet: {
		spring: '52px',
		spring2: '170px',
		spring3: '18px',
		size: 'larger' as const,
		width: '50%',
	},
	phone: {
		spring: '68px',
		spring2: '215px',
		spring3: '25px',
		size: 38 as const,
		width: '100%',
	},
};

const Welcome_0: NuggBookPage = ({ setPage, close }) => {
	const [screen] = useDimensions();
	const spring = useSpring({
		from: {
			width: '0px',
			opacity: 0,
		},
		to: {
			width: layoutConfig[screen].spring,
			opacity: 1,
		},
		delay: 700 + 1 * 1000,
		config: config.molasses,
	});

	const spring2 = useSpring({
		from: {
			width: layoutConfig[screen].spring2,
			opacity: 1,
		},
		to: {
			opacity: 0,
			width: '0px',
		},

		delay: 700 + 1 * 1000,
		config: config.molasses,
	});

	const spring3 = useSpring({
		from: {
			width: layoutConfig[screen].spring3,
			opacity: 1,
		},
		to: {
			width: '0px',
			opacity: 0,
		},
		delay: 700 + 1 * 1000,
		config: config.molasses,
	});

	const spring4 = useSpring({
		from: {
			opacity: 0,
		},
		to: {
			opacity: 1,
		},
		delay: 500 + 1500 + 1 * 1000,
		config: config.default,
	});

	const spring5 = useSpring({
		from: {
			fontWeight: 500,
			color: lib.colors.semiTransparentPrimaryColor,
		},
		to: {
			fontWeight: 650,
			color: lib.colors.primaryColor,
		},
		delay: 500 + 1500 + 1 * 1000,
		config: config.default,
	});

	const setInit = client.nuggbook.useSetInit();

	return (
		<div
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<div
				style={{
					padding: '15px',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					width: '100%',
					marginTop: 40,
				}}
			>
				<Text
					size="larger"
					textStyle={{
						...lib.layout.presets.font.main.regular,
						textAlign: 'center',
						color: lib.colors.semiTransparentPrimaryColor,
					}}
				>
					welcome to
				</Text>
				<Text
					textStyle={{
						...lib.layout.presets.font.main.regular,
						textAlign: 'center',
						fontSize: layoutConfig[screen].size,
					}}
				>
					<animated.span
						style={{
							overflow: 'hidden',
							display: 'inline-flex',
							// height: '1rem',
							flexWrap: 'nowrap',
							whiteSpace: 'nowrap',
							color: lib.colors.semiTransparentPrimaryColor,

							// lineHeight: 1,
							...spring2,
						}}
					>
						the future of
					</animated.span>
					<animated.span style={{ ...spring5 }}>n</animated.span>
					<animated.span
						style={{
							display: 'inline-flex',
							overflow: 'hidden',
							...spring,
							...spring5,
						}}
					>
						ugg
					</animated.span>
					<animated.span style={{ ...spring5 }}>ft</animated.span>
					<animated.span
						style={{
							flexWrap: 'nowrap',
							lineHeight: 1,

							overflow: 'hidden',
							display: 'inline-flex',

							...spring3,
							...spring5,
						}}
					>
						s
					</animated.span>
				</Text>
			</div>

			<animated.div
				style={{
					alignItems: 'center',
					display: 'flex',
					flexDirection: 'column',
					padding: 10,
					...spring4,
				}}
			>
				<Button
					className="mobile-pressable-div"
					label={t`i got time ⌛️`}
					onClick={() => {
						setInit();
						setPage(Page.Tldr_1);
					}}
					size="large"
					buttonStyle={{
						color: lib.colors.white,
						boxShadow: lib.layout.boxShadow.basic,
						padding: '.7rem 1.3rem',
						background: lib.colors.gradient3,
						borderRadius: lib.layout.borderRadius.large,
						marginBottom: 15,
					}}
					textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
				/>

				<Button
					className="mobile-pressable-div"
					label={t`i'll figure it out 💪`}
					onClick={() => {
						setInit();
						close();
					}}
					size="large"
					buttonStyle={{
						color: lib.colors.white,
						padding: '.7rem 1.3rem',
						boxShadow: lib.layout.boxShadow.basic,
						background: lib.colors.gradient,
						borderRadius: lib.layout.borderRadius.large,
					}}
					textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
				/>
			</animated.div>
		</div>
	);
};

export default Welcome_0;
