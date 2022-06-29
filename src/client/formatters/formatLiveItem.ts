import { LiveItem, TryoutData } from '@src/client/interfaces';
import { Fraction2x16 } from '@src/classes/Fraction';
import { LiveItemFragment } from '@src/gql/types.generated';
import { buildTokenIdFactory } from '@src/prototypes';
import { formatSwapData } from '@src/client/formatters/formatSwapData';

function main<T extends LiveItemFragment | LiveItemFragment[]>(
	item: T,
): T extends LiveItemFragment ? LiveItem : LiveItem[] {
	if (Array.isArray(item)) {
		const a: LiveItem[] = [];
		for (let i = 0; i < item.length; i++) {
			a.push(calc(item[i]));
		}
		// @ts-ignore
		return a;
	}
	// @ts-ignore
	return calc(<LiveItemFragment>item);
}

export default main;

const calc = (item: LiveItemFragment) => {
	const tokenId = item.id.toItemId() as ItemId;
	const tmp: Omit<LiveItem, 'tryout'> = buildTokenIdFactory({
		tokenId,
		count: Number(item.count),
		swaps: item.swaps
			.map((y) => {
				return y ? formatSwapData(y, tokenId) : undefined;
			})
			.filter((x) => x) as LiveItem['swaps'],
		rarity: new Fraction2x16(item.rarityX16),
		isBackup: false,
		activeSwap: item.activeSwap ? formatSwapData(item.activeSwap, tokenId) : undefined,
	});

	const tryout = formatTryout(tmp.swaps);

	return {
		...tmp,
		tryout,
	};
};

const formatTryout = (input: LiveItem['swaps']) => {
	return (
		input.reduce((prev: LiveItem['tryout'] | undefined, curr) => {
			const swap: TryoutData = {
				nugg: curr.owner,
				eth: curr.eth,
			};
			/// ////////////////////////////////////////
			// @danny7even --- nothing for you to do here, just to remind you that you, the code god, would never have added this field on an object and then forget to use it 40 lines later....
			// ..... so i didnt either and didnt spend an afternoon screwing around with the graph trying to fitgure out WHY IT WASNT WORKING
			if (!curr.isTryout) return prev;
			/// ////////////////////////////////////////

			if (!prev) {
				return {
					min: swap,
					max: swap,
					count: 1,
					swaps: [swap],
				};
			}
			return {
				min: !prev.min || prev.min.eth.gt(curr.eth) ? swap : prev.min,
				max: !prev.max || prev.max.eth.lt(curr.eth) ? swap : prev.max,
				count: prev.count + 1,
				swaps: [swap, ...prev.swaps].sort((a, b) => (a.eth.gt(b.eth) ? 1 : -1)),
			};
		}, undefined) ?? { count: 0, min: undefined, max: undefined, swaps: [] }
	);
};
