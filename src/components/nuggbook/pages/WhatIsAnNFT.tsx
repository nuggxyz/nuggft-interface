import React from 'react';
import { IoIosArrowDropleftCircle, IoIosArrowDroprightCircle } from 'react-icons/io';

import lib from '@src/lib';
import Text from '@src/components/general/Texts/Text/Text';
import Button from '@src/components/general/Buttons/Button/Button';
import { NuggBookPage, Page } from '@src/interfaces/nuggbook';

const WhatIsAnNFT: NuggBookPage = ({ setPage }) => {
	return (
		<div
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				display: 'flex',
				flexDirection: 'column',
			}}
		>
			<Text size="large" textStyle={{ padding: '10px' }}>
				what is an nft?
			</Text>
			<Text
				size="medium"
				textStyle={{ padding: '15px', ...lib.layout.presets.font.main.regular }}
			>
				a decentralized art project on ethereum
			</Text>

			<div>
				<Button
					label="next"
					buttonStyle={{
						background: lib.colors.gradient,
						color: 'white',
						borderRadius: lib.layout.borderRadius.large,
						marginBottom: '.8rem',
						backgroundColor: lib.colors.white,
						alignItems: 'center',
					}}
					rightIcon={
						<IoIosArrowDroprightCircle
							color="white"
							style={{ marginLeft: '.3rem' }}
							size={20}
						/>
					}
					onClick={() => setPage(Page.TableOfContents)}
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
		</div>
	);
};

export default WhatIsAnNFT;
