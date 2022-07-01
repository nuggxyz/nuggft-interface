import React, { CSSProperties, FunctionComponent, SetStateAction, useCallback } from 'react';
import { Promise } from 'bluebird';
import { animated, UseSpringProps } from '@react-spring/web';
import { ChevronLeft } from 'react-feather';
import { t } from '@lingui/macro';
import { IoCheckmarkCircle, IoEllipseOutline, IoFilter } from 'react-icons/io5';

import TransitionText from '@src/components/general/Texts/TransitionText/TransitionText';
import useDimensions from '@src/client/hooks/useDimensions';
import client from '@src/client';
import { SearchView } from '@src/client/interfaces';
import formatSearchFilter from '@src/client/formatters/formatSearchFilter';
import useViewingNugg from '@src/client/hooks/useViewingNugg';
import useMobileViewingNugg from '@src/client/hooks/useMobileViewingNugg';
import lib, {
	isUndefinedOrNullOrArrayEmpty,
	isUndefinedOrNullOrNotArray,
	isUndefinedOrNullOrNotFunction,
} from '@src/lib';
import GodList from '@src/components/general/List/GodList';
import Button from '@src/components/general/Buttons/Button/Button';
import Flyout from '@src/components/general/Flyout/Flyout';

import NuggListRenderItem from './NuggListRenderItem';
import styles from './NuggDexComponents.styles';

export type NuggListOnScrollEndProps = {
	setLoading?: React.Dispatch<SetStateAction<boolean>>;
	sort?: 'asc' | 'desc';
	searchValue?: string;
	addToList?: boolean;
	desiredSize?: number;
	horribleMFingHack?: () => void;
};

export type NuggListProps = {
	type?: SearchView;
	style: CSSProperties | UseSpringProps;
	tokenIds: TokenId[];
	cardType: 'recent' | 'all' | 'swap';
	animationToggle?: boolean;
	horribleMFingHack2?: boolean;
	interval: number;

	onScrollEnd?: ({
		setLoading,
		sort,
		searchValue,
		addToList,
		desiredSize,
		horribleMFingHack,
	}: NuggListOnScrollEndProps) => Promise<void> | void;
	toggleValues?: string[];
	toggleInitialState?: string[];
	doToggle?: (_: string) => void;
};

const NuggList: FunctionComponent<NuggListProps> = ({
	style,
	tokenIds,
	onScrollEnd,
	animationToggle,
	cardType,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	type,
	toggleValues,
	toggleInitialState,
	doToggle,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	horribleMFingHack2 = false,
}) => {
	const [screenType, isPhone] = useDimensions();

	const viewing = client.live.searchFilter.viewing();

	// const dat = React.useMemo(() => {
	//     if (!isPhone) return [];
	//     const abc: [TokenId | undefined, TokenId | undefined][] = [];
	//     for (let i = 0; i < tokenIds.length; i += 2) {
	//         const tmp: [TokenId | undefined, TokenId | undefined] = [undefined, undefined];
	//         tmp[0] = tokenIds[i];
	//         if (i + 1 < tokenIds.length) tmp[1] = tokenIds[i + 1];
	//         abc.push(tmp);
	//     }
	//     return abc;
	// }, [tokenIds, isPhone]);

	const { gotoViewingNugg } = useViewingNugg();
	const { goto } = useMobileViewingNugg();

	const onClick = useCallback(
		(item?: TokenId) => {
			if (item) {
				if (isPhone) goto(item);
				else gotoViewingNugg(item);
			}
		},
		[gotoViewingNugg, goto, isPhone],
	);

	const _onScrollEnd = useCallback(() => {
		if (onScrollEnd) void onScrollEnd({});
	}, [onScrollEnd]);

	const updateSearchFilterTarget = client.mutate.updateSearchFilterTarget();
	const updateSearchFilterViewing = client.mutate.updateSearchFilterViewing();
	const updateSearchFilterSort = client.mutate.updateSearchFilterSort();
	const updateSearchFilterSearchValue = client.mutate.updateSearchFilterSearchValue();

	const fullRef = React.useRef(null);

	const ider = React.useId();

	return (
		<div
			style={{
				...styles.nuggListContainer,
				...(screenType === 'phone' && { position: 'relative', overflow: undefined }),
			}}
		>
			<animated.div
				ref={fullRef}
				style={{
					...styles.nuggListDefault,
					overflow: 'scroll',
					...style,
					...(screenType === 'phone' && { overflow: 'auto' }),
				}}
			>
				{/* {screenType !== 'phone' && ( */}
				<TransitionText
					Icon={
						<div style={{ marginTop: '.25rem' }}>
							<ChevronLeft />
						</div>
					}
					style={{
						...styles.nuggListTitle,
						...(isPhone && { top: 63 }),
						...(isPhone && { WebkitBackdropFilter: 'blur(30px)' }),
						...(isPhone && { background: lib.colors.transparentWhite }),
					}}
					text={isPhone ? 'Go back' : formatSearchFilter(viewing)}
					transitionText={t`Go back`}
					onClick={() => {
						updateSearchFilterTarget(undefined);
						updateSearchFilterViewing(SearchView.Home);
						updateSearchFilterSort(undefined);
						updateSearchFilterSearchValue(undefined);
					}}
				/>
				{!isUndefinedOrNullOrNotArray(toggleValues) &&
					!isUndefinedOrNullOrArrayEmpty(toggleInitialState) &&
					!isUndefinedOrNullOrNotFunction(doToggle) && (
						<Flyout
							button={
								<Button
									onClick={() => {}}
									rightIcon={<IoFilter />}
									buttonStyle={{
										borderRadius: lib.layout.borderRadius.large,
										padding: '.35rem .3rem .3rem .35rem',
										background: lib.colors.semiTransparentGrey,
									}}
								/>
							}
							containerStyle={{
								position: 'absolute',
								top: '1rem',
								right: '1rem',
								zIndex: 1000000,
							}}
							style={{
								position: 'absolute',
								top: '1.9rem',
								right: '0rem',
								overeflow: 'hidden',
							}}
							openOnHover
						>
							{toggleInitialState.map((val) => (
								<React.Fragment key={val}>
									<Button
										label={val}
										onClick={() => doToggle(val)}
										buttonStyle={{
											zIndex: 1,
											transition: `background .3s ${lib.layout.animation}`,
											// background: lib.colors.transparent,
											borderRadius: 0,
											// marginBottom: '.25rem',
											padding: '.3rem .3rem .3rem .5rem',
											display: 'flex',
											justifyContent: 'space-between',
										}}
										rightIcon={
											toggleValues.includes(val) ? (
												<IoCheckmarkCircle
													style={{ marginLeft: '.3rem' }}
													color={lib.colors.nuggBlueText}
												/>
											) : (
												<IoEllipseOutline style={{ marginLeft: '.3rem' }} />
											)
										}
									/>
								</React.Fragment>
							))}
						</Flyout>
					)}

				{viewing === type && (
					<GodList
						id={`${ider}infinite`}
						style={
							{
								// zIndex: 0,
								// overflow: 'hidden',
								// position: 'relative',
								// ...(screenType === 'phone' && { width: '100%' }),
							}
						}
						data={tokenIds}
						RenderItem={NuggListRenderItem}
						loading={false}
						coreRef={fullRef}
						disableScroll
						noOverflow
						// interval={interval}
						onScrollEnd={_onScrollEnd}
						action={onClick}
						extraData={{ cardType }}
						itemHeight={210}
						animationToggle={animationToggle}
					/>
				)}
			</animated.div>
		</div>
	);
};

export default React.memo(NuggList);
