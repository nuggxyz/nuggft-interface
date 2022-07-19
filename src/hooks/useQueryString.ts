import { parse, ParsedQs } from 'qs';
import { useMemo } from 'react';

import client from '@src/client';

export function parsedQueryString(search?: string): ParsedQs {
	if (!search) {
		// react-router-dom places search string in the hash
		const { hash } = window.location;
		search = hash.substr(hash.indexOf('?'));
	}
	return search && search.length > 1
		? parse(search, { parseArrays: false, ignoreQueryPrefix: true })
		: {};
}

export default (): ParsedQs => {
	const route = client.live.route();
	return useMemo(() => parsedQueryString(route), [route]);
};
