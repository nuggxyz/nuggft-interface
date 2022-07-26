import { Theme } from '@src/client/interfaces';

// eslint-disable-next-line import/no-cycle
import client from '..';

export function useTheme(): Theme | undefined {
	const { user, media } = client.live.darkmode();

	return user === undefined ? media : user;
}

export function useDarkMode(): boolean {
	const theme = useTheme();

	return theme === Theme.DARK;
}
