import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';

import constants from '@src/lib/constants';
import client from '@src/client';
import { SearchView } from '@src/client/interfaces';
import useDimensions from '@src/client/hooks/useDimensions';
import useToggle from '@src/hooks/useToggle';
import { isUndefinedOrNullOrArrayEmpty } from '@src/lib';

import NuggList from './components/NuggList';
import NuggLink from './components/NuggLink';
import styles from './NuggDexSearchList.styles';

type Props = Record<string, never>;

const INFINITE_INTERVAL = 25;

const NuggDexSearchList: FunctionComponent<Props> = () => {
	const epoch = client.epoch.active.useId();
	const target = client.live.searchFilter.target();
	const sort = client.live.searchFilter.sort();
	const viewing = client.live.searchFilter.viewing();
	// const activeNuggs = client.live.activeSwaps();
	// const potentialNuggs = client.live.potentialSwaps();

	const [screenType] = useDimensions();

	const updateSearchFilterTarget = client.mutate.updateSearchFilterTarget();
	const updateSearchFilterSort = client.mutate.updateSearchFilterSort();
	// const activeItems = client.live.activeItems();
	// const potentialItems = client.live.potentialItems();

	// const recentNuggs = client.live.recentSwaps();
	// const recentItems = client.live.recentItems();

	const [sortAsc, setSortAsc] = useState<{ [key in SearchView]: boolean }>({
		Pending: false,
		AllNuggs: false,
		OnSale: false,
		AllItems: false,
		Home: false,
		MyNuggs: false,
		Search: false,
	});
	const _sortAsc = useRef(sortAsc);

	const allNuggs = client.all.useNuggs();
	const loadMoreAllNuggs = client.all.usePollNuggs();
	const allItems = client.all.useItems();
	const loadMoreAllItems = client.all.usePollItems();

	React.useEffect(() => {
		loadMoreAllNuggs();
		loadMoreAllItems();
	}, []);

	useEffect(() => {
		_sortAsc.current = sortAsc;
	});

	useEffect(() => {
		if (viewing) {
			updateSearchFilterTarget(viewing);
			updateSearchFilterSort({
				direction: _sortAsc.current[viewing] ? 'asc' : 'desc',
			});
		}
	}, [viewing, setSortAsc]);

	useEffect(() => {
		if (target) {
			setSortAsc((_sort) => {
				return {
					..._sort,
					...(target && sort ? { [target]: sort === 'asc' } : {}),
				};
			});
		}
	}, [sort, target]);

	const all = client.v2.useSwapList();

	const pollMore = client.v3.usePollV3();
	const pending = client.v3.useSwapList();

	useEffect(() => {
		if (isUndefinedOrNullOrArrayEmpty(pending)) {
			pollMore();
		}
	}, [pollMore, pending, pollMore]);

	const pendingToggle = useToggle<['nuggs', 'items']>(['nuggs', 'items'], ['nuggs', 'items']);
	const liveActiveToggle = useToggle<['nuggs', 'items']>(['nuggs', 'items'], ['nuggs', 'items']);

	const liveActiveEverything = useMemo(
		() =>
			all.reduce((acc: TokenId[], curr) => {
				let tmp: TokenId[] = acc;
				if (
					(epoch &&
						+curr.toRawId() <= +epoch &&
						curr.isNuggId() &&
						liveActiveToggle[0].includes('nuggs')) ||
					(curr.isItemId() && liveActiveToggle[0].includes('items'))
				) {
					if (sortAsc[SearchView.OnSale]) {
						tmp = [...acc, curr];
					} else {
						tmp = [curr, ...acc];
					}
				}
				return tmp;
			}, []),
		[epoch, all, sortAsc, liveActiveToggle],
	);

	const pendingEverything = useMemo(() => {
		return [
			...pending.filter(
				(elem) =>
					(elem.isNuggId() && pendingToggle[0].includes('nuggs')) ||
					(elem.isItemId() && pendingToggle[0].includes('items')),
			),
		];
	}, [pending, pendingToggle]);

	const animatedStyle = useSpring({
		...styles.nuggLinksContainer,
		transform: viewing !== SearchView.Home ? 'scale(0.9)' : 'scale(1)',
		delay: constants.ANIMATION_DELAY,
	});

	const activeSearch = client.live.activeSearch();

	return (
		<div
			style={{
				...styles.searchListContainer,
				...(screenType === 'phone' && { width: '100%', height: '90%', marginTop: '2rem' }),
			}}
		>
			<animated.div style={animatedStyle}>
				<NuggLink type={SearchView.Search} disablePreview>
					<NuggList
						interval={INFINITE_INTERVAL}
						animationToggle={viewing === SearchView.Search}
						style={styles.nuggListEnter}
						tokenIds={activeSearch.map((x) => x.tokenId)}
						type={SearchView.Search}
						onScrollEnd={({ horribleMFingHack }) => {
							if (horribleMFingHack) horribleMFingHack();
						}}
						cardType="all"
					/>
				</NuggLink>
				<NuggLink
					type={SearchView.Pending}
					previewNuggs={pendingEverything}
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
					}}
				>
					<NuggList
						interval={INFINITE_INTERVAL}
						animationToggle={viewing === SearchView.Pending}
						style={styles.nuggListEnter}
						tokenIds={pendingEverything}
						type={SearchView.Pending}
						toggleValues={pendingToggle[0]}
						toggleInitialState={pendingToggle[2]}
						doToggle={pendingToggle[1] as (_: string) => void}
						cardType="all"
						onScrollEnd={pollMore}
					/>
				</NuggLink>
				<NuggLink
					type={SearchView.OnSale}
					previewNuggs={liveActiveEverything}
					style={{
						position: 'absolute',
						top: 0,
						right: 0,
					}}
				>
					<NuggList
						interval={INFINITE_INTERVAL}
						animationToggle={viewing === SearchView.OnSale}
						style={styles.nuggListEnter}
						tokenIds={liveActiveEverything}
						type={SearchView.OnSale}
						cardType="swap"
						toggleValues={liveActiveToggle[0]}
						toggleInitialState={liveActiveToggle[2]}
						doToggle={liveActiveToggle[1] as (_: string) => void}
					/>
				</NuggLink>

				<NuggLink
					style={{
						position: 'absolute',
						right: 0,
						bottom: 0,
					}}
					type={SearchView.AllItems}
					previewNuggs={allItems.first(constants.NUGGDEX_ALLNUGGS_PREVIEW_COUNT)}
				>
					<NuggList
						animationToggle={viewing === SearchView.AllItems}
						style={styles.nuggListEnter}
						tokenIds={allItems}
						interval={INFINITE_INTERVAL}
						type={SearchView.AllItems}
						onScrollEnd={loadMoreAllItems}
						cardType="all"
					/>
				</NuggLink>
				<NuggLink
					style={{
						// width: '100%',
						position: 'absolute',
						left: 0,
						bottom: 0,
					}}
					type={SearchView.AllNuggs}
					previewNuggs={allNuggs.first(constants.NUGGDEX_ALLNUGGS_PREVIEW_COUNT)}
				>
					<NuggList
						animationToggle={viewing === SearchView.AllNuggs}
						style={styles.nuggListEnter}
						tokenIds={allNuggs}
						cardType="all"
						interval={INFINITE_INTERVAL}
						type={SearchView.AllNuggs}
						onScrollEnd={loadMoreAllNuggs}
					/>
				</NuggLink>
			</animated.div>
		</div>
	);
};

export default React.memo(NuggDexSearchList);
