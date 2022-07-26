import React from 'react';
import { IoIosArrowDropleftCircle } from 'react-icons/io';
import { BsApple } from 'react-icons/bs';
import { HiArrowRight } from 'react-icons/hi';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import Button from '@src/components/general/Buttons/Button/Button';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';
import NLStaticImage from '@src/components/general/NLStaticImage';
import { Peer } from '@src/web3/core/interfaces';

const Setup_2: NuggBookPage = ({ setPage }) => {
	return (
		<div
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
				flexDirection: 'column',
				textAlign: 'center',
			}}
		>
			<Text
				size="larger"
				textStyle={{
					marginTop: 20,

					textAlign: 'center',
					fontWeight: lib.layout.fontWeight.thicc,
				}}
			>
				2️⃣ 💸 <span style={{ paddingLeft: 5 }}>{t`buy some eth`}</span>
			</Text>

			<div style={{ padding: '10px 0px', marginTop: 10 }}>
				<Text
					size="large"
					textStyle={{ ...lib.layout.presets.font.main.regular, padding: 20 }}
				>
					<span
						style={{
							alignItems: 'center',
							padding: '.3rem .5rem',
							display: 'inline-flex',
							justifyContent: 'flex-start',
							background: lib.colors.green,
							color: 'white',
							fontSize: '16px',
							borderRadius: lib.layout.borderRadius.large,
							...lib.layout.presets.font.main.semibold,
						}}
					>
						<span>{t`easy for `}</span>
						<span
							style={{ fontWeight: 'bolder', marginLeft: 4 }}
						>{t`coinbase users`}</span>
					</span>
				</Text>
				<div
					style={{
						// marginTop: 10,
						padding: 10,
						borderRadius: lib.layout.borderRadius.medium,
						// border: `${lib.colors.primaryColor} solid 3px`,
						boxShadow: lib.layout.boxShadow.basic,
						background: lib.colors.transparentWhite,
					}}
				>
					<div
						style={{
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'center',
							textAlign: 'center',
							alignItems: 'center',
							padding: 10,
						}}
					>
						<NLStaticImage image={Peer.Coinbase} />{' '}
						<HiArrowRight size={23} style={{ marginRight: 3, margin: '0px 30px' }} />
						<NLStaticImage image="coinbasewallet_icon" />
					</div>

					<Text
						size="large"
						textStyle={{
							marginBottom: 10,
							...lib.layout.presets.font.main.regular,
							fontWeight: lib.layout.fontWeight.thicc,
						}}
					>
						{t`transfer from exchange`}
					</Text>
				</div>
			</div>
			<div style={{ padding: '10px 0px' }}>
				<Text
					size="large"
					textStyle={{ ...lib.layout.presets.font.main.regular, padding: 20 }}
				>
					<span
						style={{
							alignItems: 'center',
							padding: '.3rem .5rem',
							display: 'inline-flex',
							justifyContent: 'flex-start',
							background: lib.colors.green,
							color: 'white',
							fontSize: '16px',
							borderRadius: lib.layout.borderRadius.large,
							...lib.layout.presets.font.main.semibold,
						}}
					>
						<span>{t`easy for `}</span>
						<span style={{ fontWeight: 'bolder', marginLeft: 4 }}>{t`everyone`}</span>
					</span>
				</Text>
				<div
					style={{
						// marginTop: 10,
						padding: 10,
						borderRadius: lib.layout.borderRadius.medium,
						// border: `${lib.colors.primaryColor} solid 3px`,
						boxShadow: lib.layout.boxShadow.basic,
						background: lib.colors.transparentWhite,
					}}
				>
					<div
						style={{
							fontSize: 30,
							display: 'flex',
							flexDirection: 'row',
							justifyContent: 'center',
							textAlign: 'center',
							alignItems: 'center',
							padding: 10,
						}}
					>
						<div
							style={{
								fontFamily: lib.layout.fontFamily.sansserif,
								display: 'flex',
								justifyContent: 'center',

								alignItems: 'center',
							}}
						>
							<BsApple size={23} style={{ marginRight: 3 }} />
							<span style={{ fontSize: 30 }}>Pay</span>
						</div>
						<Text textStyle={{ padding: 10, fontSize: 30 }}>🏛</Text>
						<Text textStyle={{ fontSize: 30 }}>💳 </Text>
						<HiArrowRight size={23} style={{ marginRight: 3, margin: '0px 30px' }} />
						<NLStaticImage image="metamask_icon" />
					</div>

					<Text
						size="large"
						textStyle={{
							...lib.layout.presets.font.main.regular,
							fontWeight: lib.layout.fontWeight.thicc,
							marginBottom: 10,
						}}
					>
						{t`buy in wallet`}
					</Text>
				</div>
			</div>

			<div
				style={{
					marginTop: 20,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
				}}
			>
				<Button
					className="mobile-pressable-div"
					label={t`ready for lift off 🚀`} // maybe "give me something harder"
					onClick={() => {
						setPage(Page.Setup_3, true);
					}}
					size="large"
					buttonStyle={{
						color: lib.colors.white,
						boxShadow: lib.layout.boxShadow.basic,
						padding: '.7rem 1.3rem',

						background: lib.colors.primaryColor,
						borderRadius: lib.layout.borderRadius.large,
						marginBottom: 15,
					}}
					textStyle={{ fontWeight: lib.layout.fontWeight.thicc }}
				/>
				<Button
					buttonStyle={{
						backgroundColor: lib.colors.transparentWhite,
						color: lib.colors.primaryColor,
						borderRadius: lib.layout.borderRadius.large,
						marginBottom: '.4rem',
						// width: '13rem',
						alignItems: 'center',
					}}
					label={t`back`}
					leftIcon={
						<IoIosArrowDropleftCircle
							color={lib.colors.primaryColor}
							style={{ marginRight: '.3rem' }}
							size={20}
						/>
					}
					onClick={() => setPage(Page.Setup_1, false)}
				/>
			</div>
		</div>
	);
};

export default Setup_2;
