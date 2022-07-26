import React from 'react';
import { IoIosArrowDropleftCircle } from 'react-icons/io';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import Button from '@src/components/general/Buttons/Button/Button';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';

const HelpingTest_0: NuggBookPage = ({ setPage }) => {
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
			{/* <Text
                size="larger"
                textStyle={{
                    marginTop: 10,
                    textAlign: 'center',
                    fontWeight: lib.layout.fontWeight.thicc,
                }}
            >
                <span style={{ paddingLeft: 5 }}>thank you! 🤠</span>
            </Text> */}
			<div style={{ padding: '10px 0px' }}>
				<div
					style={{
						// marginTop: 10,
						borderRadius: lib.layout.borderRadius.medium,
						// border: `${lib.colors.primaryColor} solid 3px`,
						// boxShadow: lib.layout.boxShadow.basic,
					}}
				>
					<div
						style={{
							padding: 10,
							justifyContent: 'center',
							alignItems: 'flex-start',
							display: 'flex',
							flexDirection: 'column',
							borderRadius: lib.layout.borderRadius.medium,
							background: lib.colors.transparentWhite,
						}}
					>
						<Text
							size="large"
							textStyle={{
								padding: '5px',
								width: '100%',

								...lib.layout.presets.font.main.regular,
								// margin: '15px 0px',
								fontWeight: lib.layout.fontWeight.bold,
								// marginBottom: 10,
							}}
						>
							your mission
						</Text>

						<Text
							size="large"
							textStyle={{
								padding: 5,

								...lib.layout.presets.font.main.regular,
								// margin: '15px 0px',
								fontWeight: lib.layout.fontWeight.semibold,
								// marginBottom: 10,
							}}
						>
							{t`1️⃣ get a nugg in your wallet`}
						</Text>
						<Text
							size="large"
							textStyle={{
								padding: 5,

								...lib.layout.presets.font.main.regular,
								// margin: '15px 0px',
								fontWeight: lib.layout.fontWeight.semibold,
								// marginBottom: 10,
							}}
						>
							{t`2️⃣ re-dress your nugg`}
						</Text>
						<Text
							size="large"
							textStyle={{
								padding: 5,

								...lib.layout.presets.font.main.regular,
								// margin: '15px 0px',
								fontWeight: lib.layout.fontWeight.semibold,
								// marginBottom: 10,
							}}
						>
							{t`3️⃣ HAVE FUN 🤠`}
						</Text>
					</div>
					<div style={{ padding: 5 }}>
						<Text
							size="large"
							textStyle={{
								padding: '10px 0px',

								...lib.layout.presets.font.main.regular,
								// margin: '15px 0px',
								fontWeight: lib.layout.fontWeight.semibold,
								// marginBottom: 10,
							}}
						>
							{t`follow the setup, but dont purchase anything --- we can help get you
                            free testnet ethereum, just ask!`}
						</Text>
						<Text
							size="large"
							textStyle={{
								padding: '10px 0px',

								...lib.layout.presets.font.main.regular,
								// margin: '15px 0px',
								fontWeight: lib.layout.fontWeight.semibold,
								// marginBottom: 10,
							}}
						>
							{t`make sure you are on the rinkeby blockchain (we can help you with this too)`}
						</Text>

						<Text
							size="small"
							textStyle={{
								...lib.layout.presets.font.main.regular,
								// marginTop: '10px',
								fontWeight: lib.layout.fontWeight.thicc,
								// marginBottom: 10,
							}}
						>
							{t`ps: you rock 💙`}
						</Text>
					</div>
				</div>
			</div>

			<Button
				buttonStyle={{ background: 'transparent' }}
				label="just click the little 💬 to give feedback"
				onClick={() => {
					setPage(Page.Feedback);
				}}
			/>

			<Button
				buttonStyle={{
					background: lib.colors.gradient2,
					color: 'white',
					borderRadius: lib.layout.borderRadius.large,
					marginBottom: '.4rem',
					backgroundColor: lib.colors.white,
					// width: '13rem',
					alignItems: 'center',
				}}
				label="back"
				leftIcon={
					<IoIosArrowDropleftCircle
						color="white"
						style={{ marginRight: '.3rem' }}
						size={20}
					/>
				}
				onClick={() => setPage(Page.TableOfContents)}
			/>
		</div>
	);
};

export default HelpingTest_0;
