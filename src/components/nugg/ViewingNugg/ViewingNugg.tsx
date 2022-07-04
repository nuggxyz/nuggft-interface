import React, { FunctionComponent, useMemo, useState } from 'react';
import { t } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';
import { IoArrowRedo, IoChevronDown, IoChevronUp } from 'react-icons/io5';

import lib from '@src/lib';
import Loader from '@src/components/general/Loader/Loader';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import client from '@src/client';
import HappyTabber from '@src/components/general/HappyTabber/HappyTabber';
import AddressViewer from '@src/components/general/Texts/AddressViewer/AddressViewer';
import useViewingNugg from '@src/client/hooks/useViewingNugg';
import globalStyles from '@src/lib/globalStyles';
import AnimatedCard from '@src/components/general/Cards/AnimatedCard/AnimatedCard';
import Button from '@src/components/general/Buttons/Button/Button';
import Flyout from '@src/components/general/Flyout/Flyout';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import { LiveToken } from '@src/client/interfaces';
import { useLiveTokenPoll } from '@src/client/subscriptions/useLiveNugg';
import { useLifecycleData } from '@src/client/hooks/useLifecycle';

import styles from './ViewingNugg.styles';
import SwapList from './SwapList';
import MyNuggActions from './MyNuggActions';
import ItemList from './ItemList';
import ActiveSwap from './ActiveSwap';

type Props = Record<string, never>;

const Mem = React.memo<{ token?: LiveToken }>(({ token }) => <SwapList token={token} />);

const ViewingNugg: FunctionComponent<Props> = () => {
	const epoch = client.epoch.active.useId();

	const { safeTokenId: tokenId } = useViewingNugg();
	const [, activeSwap] = useLifecycleData(tokenId);

	const sender = web3.hook.usePriorityAccount();

	const chainId = web3.hook.usePriorityChainId();
	const provider = web3.hook.usePriorityProvider();

	useLiveTokenPoll(tokenId !== undefined, tokenId);

	const token = client.live.token(tokenId);

	const List = React.useMemo(
		() =>
			tokenId && tokenId.isNuggId() && token && token.type === 'nugg' && tokenId ? (
				<ItemList
					items={token?.items || []}
					isOwner={!!sender && sender === token.owner && !token?.activeSwap?.tokenId}
					tokenId={tokenId}
				/>
			) : null,
		[tokenId, token],
	);

	const happyTabs = useMemo(() => {
		return [
			...(activeSwap
				? [
						{
							label: t`Active`,
							comp: React.memo(ActiveSwap),
						},
				  ]
				: []),
			...(token && token.type === 'nugg' && token.owner === sender
				? [
						{
							label: t`My Nugg`,
							comp: React.memo(MyNuggActions),
						},
				  ]
				: []),
			{
				label: t`Purchases`,
				comp: Mem,
			},
			...(provider &&
			chainId &&
			token &&
			token.type === 'nugg' &&
			tokenId &&
			tokenId.isNuggId()
				? [
						{
							label: 'Items',
							comp: () => List,
						},
				  ]
				: []),
			...(token && token.type === 'nugg'
				? [
						{
							label: t`History`,
							comp: React.memo(MyNuggActions),
						},
				  ]
				: []),
		];
	}, [token, sender, chainId, provider, tokenId, List, activeSwap]);

	const navigate = useNavigate();

	const usdMin = client.usd.useUsdPair(token?.isItem() ? token?.tryout?.min?.eth : undefined);
	const usdMax = client.usd.useUsdPair(token?.isItem() ? token?.tryout?.max?.eth : undefined);

	const [expanded, setExpanded] = useState(false);

	return (
		<div
			style={{ ...styles.container, opacity: provider && epoch && tokenId && token ? 1 : 0 }}
		>
			<>
				<div style={styles.swapsWrapper}>
					<div style={styles.swaps}>
						<div style={styles.owner}>
							<div style={{ display: 'flex' }}>
								<Text textStyle={styles.nuggId} size="larger">
									{tokenId && tokenId.toPrettyId()}
								</Text>
								{token && token.type === 'nugg' ? (
									token.owner ? (
										<div
											style={{
												marginLeft: '1rem',
												display: 'flex',
												justifyContent: 'center',
												flexDirection: 'column',
											}}
										>
											<Text
												type="text"
												size="smaller"
												textStyle={{
													color: lib.colors.white,
												}}
											>
												{t`Owned by`}
											</Text>
											<div style={globalStyles.centered}>
												<AddressViewer
													address={token.owner}
													textStyle={styles.titleText}
													param={token.owner}
													route="address"
													size="large"
													isNugg={false}
												/>
											</div>
										</div>
									) : (
										<Loader color={lib.colors.nuggBlueText} />
									)
								) : token ? (
									token.type === 'item' &&
									token.tryout.count > 0 &&
									token.tryout.max &&
									token.tryout.min ? (
										<div
											style={{
												...globalStyles.centeredSpaceBetween,
												...globalStyles.fillWidth,
											}}
										>
											<div style={{ marginLeft: '1rem' }}>
												<Text
													type="text"
													size="small"
													textStyle={{
														color: lib.colors.white,
														// marginLeft: '1rem',
													}}
												>
													{t`Owned by ${token.count} Nugg${
														token.count > 1 || !token.count ? 's' : ''
													}`}
												</Text>
												<Flyout
													// openOnHover
													float="left"
													top={25}
													triggerWidth="130px"
													containerStyle={{
														position: 'relative',
													}}
													button={
														<Text
															textStyle={{
																color: lib.colors.nuggBlueText,
															}}
															size="medium"
														>
															{t`${token.tryout.count} Nugg${
																token.tryout.count > 1 ? 's' : ''
															} ${
																token.tryout.count > 1
																	? 'are'
																	: 'is'
															} swapping`}
														</Text>
													}
												>
													<div
														style={{
															padding: '.5rem 1rem',
															zIndex: 1000,
														}}
													>
														<Text
															size="medium"
															textStyle={{
																paddingBottom: '.25rem',
															}}
														>{t`Swap price${
															token.tryout.min.eth.eq(
																token.tryout.max.eth,
															)
																? ''
																: 's'
														}`}</Text>
														{token.tryout.min.eth.eq(
															token.tryout.max.eth,
														) ? (
															<CurrencyText
																size="small"
																type="text"
																image="eth"
																value={usdMin}
															/>
														) : (
															<div>
																<div style={{ display: 'flex' }}>
																	<CurrencyText
																		image="eth"
																		size="small"
																		type="text"
																		value={usdMin}
																	/>
																	<Text
																		size="small"
																		textStyle={{
																			marginLeft: '5px',
																		}}
																	>{t`Min`}</Text>
																</div>
																<div style={{ display: 'flex' }}>
																	<CurrencyText
																		image="eth"
																		size="small"
																		type="text"
																		value={usdMax}
																	/>
																	<Text
																		size="small"
																		textStyle={{
																			marginLeft: '5px',
																		}}
																	>{t`Max`}</Text>
																</div>
															</div>
														)}
													</div>
												</Flyout>
											</div>
											{!token.activeSwap ? (
												<Button
													buttonStyle={{
														...styles.goToSwap,
														marginBottom: '0rem',
													}}
													onClick={() =>
														navigate(`/swap/${token.tokenId}`)
													}
													size="small"
													textStyle={{
														...styles.goToSwapGradient,
														background: lib.colors.gradient2,
														paddingRight: '.5rem',
													}}
													label={t`Go to swap`}
													rightIcon={
														<IoArrowRedo color={lib.colors.green} />
													}
												/>
											) : null}
										</div>
									) : (
										<Text
											type="text"
											size="medium"
											textStyle={{
												color: lib.colors.white,
												marginLeft: '1rem',
											}}
										>
											{t`Owned by ${token.count} Nugg${
												token.count > 1 || !token.count ? 's' : ''
											}`}
										</Text>
									)
								) : null}
							</div>
							<div style={{ display: 'flex' }}>
								<div
									style={{
										opacity: expanded ? 1 : 0,
										transition: `opacity .5s ${lib.layout.animation}`,
										marginRight: '.5rem',
									}}
								>
									<TokenViewer
										tokenId={tokenId}
										disableOnClick
										style={{
											height: '45px',
											width: '45px',
										}}
									/>
								</div>
								<Button
									buttonStyle={{
										borderRadius: lib.layout.borderRadius.mediumish,
										boxShadow: lib.layout.boxShadow.medium,
									}}
									rightIcon={
										expanded ? (
											<IoChevronDown
												color={lib.colors.nuggBlueText}
												size={26}
											/>
										) : (
											<IoChevronUp
												color={lib.colors.nuggBlueText}
												size={26}
											/>
										)
									}
									onClick={() => setExpanded((e) => !e)}
								/>
							</div>
						</div>
						<div
							style={{
								...styles.nuggContainer,
								marginTop: token && token.type === 'item' ? '1.5rem' : '0rem',
								opacity: expanded ? 0 : 1,
								height: expanded ? '0px' : '400px',
								overflow: expanded ? 'hidden' : 'visible',
								transition: `all .5s ${lib.layout.animation}`,
							}}
						>
							<div
								style={{
									height: '400px',
									width: '400px',
									position: 'relative',
									padding: '.5rem',
								}}
							>
								<div style={{ position: expanded ? 'relative' : 'fixed' }}>
									<AnimatedCard>
										{tokenId && (
											<TokenViewer
												tokenId={tokenId}
												showcase
												disableOnClick
											/>
										)}
									</AnimatedCard>
								</div>
							</div>
						</div>
						<HappyTabber
							defaultActiveIndex={0}
							items={happyTabs}
							selectionIndicatorStyle={{ background: lib.colors.white }}
							bodyStyle={styles.tabberList}
							headerContainerStyle={{
								marginTop: '1.5rem',
								padding: '0rem 1rem',
								borderRadius: 0,
							}}
						/>
					</div>
				</div>
			</>
		</div>
	);
};

export default React.memo(ViewingNugg);
