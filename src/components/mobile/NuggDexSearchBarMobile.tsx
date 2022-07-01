import { animated } from '@react-spring/web';
import React, { FC, FunctionComponent, useEffect, useState } from 'react';
import { X } from 'react-feather';
import { t } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';
import { IoSearch } from 'react-icons/io5';

import Button from '@src/components/general/Buttons/Button/Button';
import TextInput from '@src/components/general/TextInputs/TextInput/TextInput';
import Text from '@src/components/general/Texts/Text/Text';
import client from '@src/client';
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib/index';
import useOnClickOutside from '@src/hooks/useOnClickOutside';
import useDimensions from '@src/client/hooks/useDimensions';
import styles from '@src/components/nugg/NuggDex/NuggDexSearchBar/NuggDexSearchBar.styles';
import Label from '@src/components/general/Label/Label';
import TokenViewer from '@src/components/nugg/TokenViewer';
import IconButton from '@src/components/general/Buttons/IconButton/IconButton';
import web3 from '@src/web3';
import { useXNuggftV1 } from '@src/contracts/useContract';
import { XNuggftV1 } from '@src/typechain/XNuggftV1';

import { MobileContainerBig } from './NuggListRenderItemMobile';
import NuggDexSearchListMobile2 from './NuggDexSearchListMobile2';

enum FilterEnum {
	NuggsThatOwnThisItem,
	BunchOfNuggs,
}

export interface FilterBase {
	type: FilterEnum;
	only: 'nuggs' | 'items' | 'both';
}

export interface NuggsThatOwnThisItemFilter extends FilterBase {
	type: FilterEnum.NuggsThatOwnThisItem;
	only: 'nuggs';
	itemId: ItemId;
}

export interface BunchOfNuggsFilter extends FilterBase {
	type: FilterEnum.NuggsThatOwnThisItem;
	only: 'nuggs';
	start: number;
	size: number;
}

export interface BunchOfItemsFilter extends FilterBase {
	type: FilterEnum.NuggsThatOwnThisItem;
	only: 'items';
	feauture: number;
}

export type Filter = NuggsThatOwnThisItemFilter;

export const SearchBarItem: FC<{ item: ItemId }> = ({ item }) => {
	const navigate = useNavigate();

	const potential = client.v3.useSwap(item);
	return (
		<div
			aria-hidden="true"
			className="mobile-pressable-div"
			style={{
				display: 'flex',
				alignItems: 'center',
				position: 'relative',
				width: '150px',
				marginBottom: 15,
				height: '150px',
				flexDirection: 'column',
				justifyContent: 'center',
				background:
					(potential?.count ?? 0) > 0
						? lib.colors.gradient3Transparent
						: lib.colors.transparentWhite,
				borderRadius: lib.layout.borderRadius.mediumish,
			}}
			onClick={() => {
				navigate(`/swap/${item}`);
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
					text={item.toPrettyId()}
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
					tokenId={item}
					style={{
						height: '80px',
						width: '80px',
					}}
				/>
			</div>

			{(potential?.count ?? 0) > 0 ? (
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
					<Label
						size="small"
						text={`${potential?.count ?? 0} for sale`}
						containerStyles={{ background: lib.colors.gradient3 }}
						textStyle={{ color: 'white' }}
					/>
				</div>
			) : null}
		</div>
	);
};

const SearchBarResults = ({ tokens }: { tokens: TokenId[] }) => {
	const nuggs = React.useMemo(() => {
		const res = tokens.filter((x) => x.isNuggId());
		if (res) return res;
		return [];
	}, [tokens]);

	const itemsData = React.useMemo(() => {
		return tokens.filter((x) => x.isItemId()) as ItemId[];
	}, [tokens]);

	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				// padding: '10px',
				display: 'flex',
				flexDirection: 'column',
				overflow: 'scroll',
			}}
		>
			{nuggs.length > 0 && (
				<div
					style={{
						paddingTop: 20,
						display: 'flex',
						flexDirection: 'column',
						width: '100%',
						alignItems: 'flex-start',
					}}
				>
					<Text
						size="larger"
						textStyle={{
							...lib.layout.presets.font.main.thicc,
							paddingBottom: 10,
							paddingLeft: 10,
						}}
					>
						nuggs
					</Text>
					{nuggs.map((x) => (
						<div
							key={`searcher${x}`}
							style={{
								width: '100%',
								height: '100%',
								padding: '10px',
								display: 'flex',
								flexWrap: 'wrap',
								justifyContent: 'space-around',
							}}
						>
							<MobileContainerBig tokenId={x} />{' '}
						</div>
					))}
					<div style={{ width: '100%', marginTop: 10 }} />
				</div>
			)}

			<Text
				size="larger"
				textStyle={{
					...lib.layout.presets.font.main.thicc,
					paddingBottom: 20,
					paddingLeft: 10,
				}}
			>
				items
			</Text>
			<div
				style={{
					width: '100%',
					height: '100%',
					// padding: '10px',
					marginBottom: '30px',
					display: 'flex',
					flexWrap: 'wrap',
					justifyContent: 'space-around',
				}}
			>
				{itemsData.map((x) => (
					<>
						<SearchBarItem item={x} key={`searcher-${x}`} />
					</>
				))}
				<div style={{ width: '100%', height: 70 }} />
			</div>
		</div>
	);
};

const NuggDexSearchBarMobile: FunctionComponent<unknown> = () => {
	const sort = client.live.searchFilter.sort();
	const searchValue = client.live.searchFilter.searchValue();
	const [, isPhone] = useDimensions();

	const [localSearchValue, setSearchValue] = useState('');
	const [isUserInput, setIsUserInput] = useState(false);
	const updateSearchFilterSearchValue = client.mutate.updateSearchFilterSearchValue();
	const updateSearchFilterSort = client.mutate.updateSearchFilterSort();

	const [sortAsc, setSortAsc] = useState(sort && sort.direction === 'asc');

	const nuggbookClose = client.nuggbook.useCloseNuggBook();

	useEffect(() => {
		updateSearchFilterSearchValue(localSearchValue);
	}, [localSearchValue, updateSearchFilterSearchValue]);

	useEffect(() => {
		if (sort) {
			if (sortAsc && (sort.direction === 'asc') !== sortAsc && isUserInput) {
				setIsUserInput(false);
				updateSearchFilterSort({
					by: 'id',
					direction: 'asc',
				});
			} else {
				setSortAsc(sort.direction === 'asc');
			}
		}
	}, [sortAsc, sort, isUserInput, updateSearchFilterSort]);

	const blocknum = client.block.useBlock();

	const provider = web3.hook.usePriorityProvider();
	const xnuggft = useXNuggftV1(provider);

	const backupNuggs = client.all.useBackupNuggs();
	const backupItems = client.all.useBackupItems();
	const nuggs = client.all.useNuggs();
	const items = client.all.useItems();

	// const [, v2] = client.v2.useV2Query();

	const caller = React.useCallback(
		(_xnuggft: XNuggftV1) => {
			if (_xnuggft?.provider) {
				void backupItems(_xnuggft);
				void backupNuggs(_xnuggft);
				// void v2(blocknum);
			}
		},
		[backupItems, backupNuggs, blocknum],
	);

	React.useEffect(() => {
		if (xnuggft && provider) void caller(xnuggft);
	}, [xnuggft, provider]);

	const [searchResults, setSearchResults] = useState<TokenId[]>([]);

	useEffect(() => {
		if (localSearchValue && localSearchValue !== '') {
			const res = [
				...nuggs.filter(
					(x) =>
						x.toRawIdNum() === Number(localSearchValue) ||
						x.toRawIdNum() - 1000000 === Number(localSearchValue),
				),
				...items.filter((x) => x.toRawIdNum() % 1000 === Number(localSearchValue)),
			];
			setSearchResults(res);
		} else {
			setSearchResults([]);
		}
		return () => {};
	}, [localSearchValue, setSearchResults, nuggs, items]);

	const ref = React.useRef<HTMLDivElement>(null);

	const jumpShip = React.useCallback(() => {
		nuggbookClose();
	}, [nuggbookClose]);

	useOnClickOutside(ref, jumpShip);

	return (
		<animated.div
			ref={ref}
			style={{
				zIndex: 999,
				...lib.layout.presets.font.main.regular,
				width: '100%',
				position: 'relative',
				display: 'flex',
				justifyContent: 'flex-start',
				height: '100%',
				flexDirection: 'column',
				pointerEvents: 'auto',
			}}
		>
			<TextInput
				// triggerFocus={open}

				placeholder={t`Type a number to search`}
				restrictToNumbers
				value={localSearchValue || ''}
				setValue={setSearchValue}
				className={isPhone ? 'placeholder-dark' : 'placeholder-blue'}
				style={{
					marginTop: 12,
					width: '100%',

					position: 'relative',
					padding: 5,
					background: lib.colors.transparentWhite,
					WebkitBackdropFilter: 'blur(50px)',
					backdropFilter: 'blur(50px)',
					borderRadius: lib.layout.borderRadius.large,
					zIndex: 1000,
					display: 'flex',
				}}
				styleInputContainer={{
					width: '100%',
					background: 'transparent',
					display: 'flex',
				}}
				leftToggles={[
					<IconButton
						aria-hidden="true"
						buttonStyle={{
							padding: 0,
							height: 75,
							width: 75,
							background: 'transparent',
							borderRadius: lib.layout.borderRadius.large,
						}}
						onClick={() => {}}
						iconComponent={
							<IoSearch
								style={{
									color: lib.colors.semiTransparentPrimaryColor,
								}}
								size={50}
							/>
						}
					/>,
				]}
				rightToggles={[
					...(localSearchValue
						? [
								<Button
									buttonStyle={styles.searchBarButton}
									onClick={() => {
										if (isUndefinedOrNullOrStringEmpty(searchValue)) {
											nuggbookClose();
										} else {
											setSearchValue('');
										}
									}}
									rightIcon={
										<X
											style={{
												color: lib.colors.primaryColor,
											}}
										/>
									}
								/>,
						  ]
						: []),
				]}
			/>

			<div
				style={{
					height: '100%',
					width: '100%',
					zIndex: 1001,
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				{isUndefinedOrNullOrStringEmpty(localSearchValue) ? (
					<div style={{ width: '100%', height: '100%', padding: '0px 10px' }}>
						<NuggDexSearchListMobile2 />
					</div>
				) : searchResults.length === 0 ? (
					<Text textStyle={styles.resultText}>
						{isUndefinedOrNullOrStringEmpty(localSearchValue)
							? t`Type a number`
							: t`No results`}
					</Text>
				) : (
					<SearchBarResults tokens={searchResults} />
				)}
			</div>
		</animated.div>
	);
};

export default NuggDexSearchBarMobile;
