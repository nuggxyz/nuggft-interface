/* eslint-disable no-param-reassign */
import create from 'zustand';
import { combine, persist } from 'zustand/middleware';

import useDebounce from '@src/hooks/useDebounce';
import emitter from '@src/emitter';

const useStore = create(
	persist(
		combine(
			{
				block: 0 as number,
				lastUpdate: 0 as number,
				lastChange: 0 as number,
				history: [] as { block: number; time: number }[],
			},
			(set, get) => {
				const update = (block: number) => {
					const time = new Date().getTime();
					const change = block !== get().block;
					const { history } = get();
					if (change) {
						if (history.length > 9) history.pop();
						history.push({ block, time });
					}

					set(() => ({
						block,
						lastUpdate: time,
						...(change && { lastChange: time }),
						history,
					}));
				};

				return { update };
			},
		),
		{ name: 'nugg.xyz-block' },
	),
);

export const useBlockUpdater = () => {
	const update = useStore((state) => state.update);

	emitter.useOn(
		emitter.events.IncomingRpcBlock,
		(data) => {
			update(data.data);
		},
		[update],
	);

	return null;
};

export default {
	useHistory: () => useStore((state) => state.history),

	useBlock: () => useStore((state) => state.block),
	useLastUpdate: () => useStore((state) => state.lastUpdate),
	useLastChange: () => useStore((state) => state.lastChange),

	useBlockWithDebounce: (delay: number) => {
		const block = useStore((state) => state.block);
		return useDebounce(block, delay);
	},

	useUpdateBlock: () => useStore((state) => state.update),
};
