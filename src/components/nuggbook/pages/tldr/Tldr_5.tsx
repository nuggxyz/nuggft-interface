import React from 'react';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import { NuggBookPage } from '@src/interfaces/nuggbook';
import useDimensions from '@src/client/hooks/useDimensions';
import packages from '@src/packages';

const Tldr_5: NuggBookPage = ({ close }) => {
	const [screen] = useDimensions();
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
	return (
		<div
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
				flexDirection: 'column',
				marginTop: 20,
				width: screen === 'phone' ? undefined : '80%',
			}}
		>
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
					// marginBottom: '.4rem',
					backgroundColor: 'transparent',
					height: 50,
					marginBottom: 10,
				}}
			>
				<span
					style={{
						color: lib.colors.transparentPrimaryColor,
						...lib.layout.presets.font.main.semibold,
						fontWeight: lib.layout.fontWeight.thicc,
						fontSize: '40px',
					}}
				>
					🔒
				</span>
			</div>

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
					// marginBottom: '.4rem',
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
					{t`security`}
				</span>
			</div>

			{/* <div
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
                        marginLeft: 10,
                        fontSize: '20px',
                        color: lib.colors.transparentPrimaryColor,
                        ...lib.layout.presets.font.main.semibold,
                    }}
                >
                    {t`its time to stop blaming users for being scammed`}
                </span>
            </div> */}

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
						marginLeft: 10,
						fontSize: '20px',
						color: lib.colors.transparentPrimaryColor,
						...lib.layout.presets.font.main.semibold,
					}}
				>
					{t`nuggft was designed from the ground up to`} <b>{t`protect users`}</b>
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
						marginLeft: 10,
						fontSize: '20px',
						color: lib.colors.transparentPrimaryColor,
						...lib.layout.presets.font.main.semibold,
					}}
				>
					{t`our auction system is built in a way that eliminates any monitary incentive an attacker may have`}
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
						marginLeft: 10,
						fontSize: '20px',
						color: lib.colors.transparentPrimaryColor,
						...lib.layout.presets.font.main.semibold,
					}}
				>
					{t`we cannot stop all attacks, but we can give nuggft users the power to fight back`}
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
						close();
					}}
				>
					<span style={{ ...lib.layout.presets.font.main.thicc }}>{t`i'm ready`}</span>
				</packages.spring.animated.div>
			)}
		</div>
	);
};

export default Tldr_5;
