import { LiveNugg } from '@src/client/interfaces';
import { LiveNuggFragment } from '@src/gql/types.generated';
import { buildTokenIdFactory } from '@src/prototypes';
import { formatSwapData } from '@src/client/formatters/formatSwapData';
import formatNuggItems from '@src/client/formatters/formatNuggItems';
import { parseItmeIdToNum } from '@src/lib';

export default (nugg: LiveNuggFragment): LiveNugg => {
	const tokenId = nugg.id.toNuggId();

	const items = formatNuggItems(nugg);

	const pickups = nugg._pickups
		.map((y) => {
			const token = y.split('-')[0].toItemId();
			const { feature, position } = parseItmeIdToNum(token);
			const curr = items.find((x) => x.feature === feature && x.position === position);
			if (curr) {
				curr.count += 1;
				return undefined;
			}
			return buildTokenIdFactory({
				tokenId: token,
				activeSwap: undefined,
				feature,
				position,
				count: 1,
				displayed: false,
			});
		})
		.filter((x): x is NonNullable<typeof x> => !!x);

	return buildTokenIdFactory({
		tokenId,
		activeLoan: !!nugg.activeLoan?.id,
		owner: nugg.user?.id as AddressString,
		items: [...items, ...pickups],
		isBackup: false,
		pendingClaim: nugg.pendingClaim,
		lastTransfer: nugg.lastTransfer,
		swaps: nugg.swaps.map((y) => {
			return formatSwapData(y, tokenId);
		}),
		activeSwap: nugg.activeSwap ? formatSwapData(nugg.activeSwap, tokenId) : undefined,
	});
};
