import React, { FC } from 'react';
import { IoArrowRedo } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { t } from '@lingui/macro';

import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import Label from '@src/components/general/Label/Label';
import client from '@src/client';
import styles from '@src/components/nugg/ViewingNugg/ViewingNugg.styles';
import { buildTokenIdFactory } from '@src/prototypes';
import { ModalEnum } from '@src/interfaces/modals';
import { MyNugg, UnclaimedOffer } from '@src/client/user';

const MyNuggItemListMobile: FC<unknown> = () => {
	const nuggs = client.user.useNuggs();

	const claims = client.user.useUnclaimedOffersFilteredByEpoch();

	return (
		<div
			style={{
				flexDirection: 'row',
				flexWrap: 'wrap',
				width: '100%',
				display: 'flex',
				justifyContent: 'space-evenly',
				overflow: 'visible',
				marginTop: '1rem',
			}}
		>
			{[...nuggs]
				.sort((a, b) => (a.tokenId.toRawIdNum() < b.tokenId.toRawIdNum() ? -1 : 1))
				.map((x, i) => (
					<MyNuggItem
						item={x}
						key={`MyNuggItemListMobile-${x.tokenId}-${i}`}
						claims={claims.filter((c) => c.tokenId === x.tokenId)}
					/>
				))}
		</div>
	);
};

const MyNuggItem: FC<{ item: MyNugg; claims: UnclaimedOffer[] }> = ({ item, claims }) => {
	const openModal = client.modal.useOpenModal();

	const navigate = useNavigate();
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
				marginBottom: '1.5rem',
				background: item.activeSwap
					? lib.colors.gradient3Transparent
					: lib.colors.transparentWhite,
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
						// marginLeft: '.5rem',
						fontSize: '10px',
						fontWeight: 'bold',
						// paddingBottom: 5,
						position: 'relative',
					}}
					text={item.tokenId.toPrettyId()}
				/>
			</div>

			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					padding: '.3rem',
					borderRadius: lib.layout.borderRadius.large,
					position: 'absolute',
					top: '.1rem',
					left: '.1rem',
					paddingBottom: 5,
				}}
			>
				<Label
					type="text"
					size="small"
					textStyle={{
						color: lib.colors.transparentDarkGrey,
						// marginLeft: '.5rem',
						fontSize: '10px',
						fontWeight: 'bold',
						// paddingBottom: 5,
						position: 'relative',
					}}
					text={item.activeLoan ? t`loaned` : t`unloaned`}
					leftDotColor={item.activeLoan ? lib.colors.green : lib.colors.red}
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
					tokenId={item.tokenId}
					style={{
						height: '225px',
						width: '225px',
					}}
				/>
			</div>

			{item.activeSwap ? (
				<div
					style={{
						position: 'absolute',
						bottom: 5,
						right: 0,
						display: 'flex',
						flexDirection: 'row',
						width: '100%',
						justifyContent: 'center',
						alignItems: 'end',
						textAlign: 'center',
					}}
				>
					<Button
						buttonStyle={{
							marginBottom: '.4rem',
							borderRadius: lib.layout.borderRadius.large,
							backgroundColor: lib.colors.white,
							padding: '.2rem .7rem',
						}}
						textStyle={{
							background: lib.colors.gradient3,
							color: 'black',
							WebkitBackgroundClip: 'text',
							WebkitTextFillColor: 'transparent',
						}}
						label={t`for sale`}
						rightIcon={<IoArrowRedo color={lib.colors.gradientPink} />}
						onClick={() => navigate(`/swap/${item.tokenId}`)}
					/>
				</div>
			) : null}

			{claims.length > 0 ? (
				<div
					style={{
						position: 'absolute',
						bottom: 5,
						left: 2,
						display: 'flex',
						flexDirection: 'row',

						justifyContent: 'center',
						alignItems: 'end',
						textAlign: 'center',
					}}
				>
					{/* {claims.map((y) => ( */}
					<div
						style={{
							// width: '100%',
							background: lib.colors.gradient2,
							borderRadius: lib.layout.borderRadius.large,
							margin: '1rem',
							paddingRight: '.2rem',
							paddingLeft: '.2rem',

							// width: '150px',
							// height: '60px',
						}}
					>
						<div
							key={`${'claims'}-swaplist`}
							style={{
								display: 'flex',
								flexDirection: 'row',
								justifyContent: 'space-between',
								width: '100%',
								padding: '.5rem',
							}}
						>
							<div
								style={{
									display: 'flex',
									flexDirection: 'row',
									alignItems: 'center',
								}}
							>
								<Label text={claims.length.toString()} size="smaller" />
								<Text
									size="smaller"
									textStyle={{
										color: 'white',
										paddingLeft: '.5rem',
									}}
								>
									{t`pending claim`}
								</Text>
							</div>
							{/* <CurrencyText size="small" image="eth" value={x.eth.number} stopAnimation /> */}
						</div>
					</div>
					{/* ))} */}
				</div>
			) : (
				<div
					style={{
						position: 'absolute',
						bottom: 5,
						display: 'flex',
						flexDirection: 'row',
						width: '100%',
						justifyContent: 'center',
						alignItems: 'end',
						textAlign: 'center',
					}}
				>
					<Button
						buttonStyle={{
							...styles.goToSwap,
						}}
						textStyle={{
							...styles.goToSwapGradient,
							padding: '.2rem',
							fontSize: '10px',
						}}
						label={t`put up for sale`}
						// rightIcon={<IoArrowRedo color={lib.colors.gradientPink} />}
						onClick={() => {
							openModal(
								buildTokenIdFactory({
									modalType: ModalEnum.Sell as const,
									tokenId: item.tokenId,
									sellingNuggId: null,
								}),
							);
						}}
					/>
				</div>
			)}
			{/* {Number(item.feature) !== constants.FEATURE_BASE &&
                extraData.isOwner &&
                (!item.activeSwap ? (
                    <Button
                        label="Sell"
                        buttonStyle={{
                            borderRadius: lib.layout.borderRadius.large,
                            background: lib.colors.gradient2Transparent,
                            position: 'absolute',
                            right: '1rem',
                        }}
                        leftIcon={<IoPricetagsOutline color={lib.colors.white} />}
                        textStyle={{
                            color: lib.colors.white,
                            marginLeft: '.5rem',
                        }}
                        type="text"
                        onClick={() => {
                            openModal({
                                modalType: ModalEnum.Sell,
                                tokenId: item.id,
                                tokenType: 'item',
                                sellingNuggId: extraData.tokenId,
                            });
                        }}
                    />
                ) : (
                    <Button
                        label="Reclaim"
                        buttonStyle={{
                            borderRadius: lib.layout.borderRadius.large,
                            background: lib.colors.gradient2Transparent,
                            position: 'absolute',
                            right: '1rem',
                        }}
                        leftIcon={<IoSync color={lib.colors.white} />}
                        textStyle={{
                            color: lib.colors.white,
                            marginLeft: '.5rem',
                        }}
                        type="text"
                        onClick={() => {
                            if (item.activeSwap && sender)
                                void send(
                                    nuggft.populateTransaction.claim(
                                        [formatItemSwapIdForSend(item.activeSwap).sellingNuggId],
                                        [Address.ZERO.hash],
                                        [sender],
                                        [formatItemSwapIdForSend(item.activeSwap).itemId],
                                    ),
                                );
                        }}
                    />
                ))} */}
		</div>
	);
};

export default MyNuggItemListMobile;
