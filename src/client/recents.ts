import create from 'zustand';
import { combine } from 'zustand/middleware';

const store = create(
	combine(
		{
			list: [] as TokenId[],
		},
		(set) => {
			const addRecent = (recent: TokenId) => {
				set((state) => {
					const listCopy = [...state.list];
					return { list: [recent, ...listCopy.filter((item) => item !== recent)] };
				});
			};
			const clearRecents = () => set(() => ({ list: [] }));
			return { addRecent, clearRecents };
		},
	),
);

export type RecentsState = ReturnType<typeof store['getState']>;

export default {
	useRecents: () => store((state) => state.list),
	useAddRecent: () => store((state) => state.addRecent),
	useClearRecents: () => store((state) => state.clearRecents),
	...store,
};
