/* eslint-disable no-param-reassign */
import React from 'react';
import create from 'zustand';
import { combine } from 'zustand/middleware';

const store = create(
	combine(
		{
			open: false,
			tokenId: undefined as NuggId | undefined,
		},
		(set) => {
			const closeEditScreen = () => {
				set(() => {
					return {
						open: false,
						tokenId: undefined,
					};
				});
			};

			const updateEditScreen = (tokenId: NuggId) => {
				set(() => {
					return {
						tokenId,
					};
				});

				return () => {
					set(() => {
						return {
							open: true,
						};
					});
				};
			};

			const openEditScreen = (tokenId: NuggId) => {
				set(() => {
					return {
						open: true,
						tokenId,
					};
				});
			};

			return { closeEditScreen, openEditScreen, updateEditScreen };
		},
	),
);

export type EditScreenState = ReturnType<typeof store['getState']>;

export default {
	useEditScreenTokenId: () => store((state) => state.tokenId),
	useEditScreenTokenIdWithOverride: (tokenId?: NuggId) =>
		store(React.useCallback((state) => tokenId ?? state.tokenId, [tokenId])),

	useEditScreenOpen: () => store((state) => state.open),
	useOpenEditScreen: () => store((state) => state.openEditScreen),
	useUpdateEditScreen: () => store((state) => state.updateEditScreen),

	useCloseEditScreen: () => store((state) => state.closeEditScreen),
	...store,
};
