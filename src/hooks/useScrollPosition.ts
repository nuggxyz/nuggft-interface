import { useState, useEffect } from 'react';

import lib from '@src/lib';

function useScrollPosition(ref: React.RefObject<HTMLDivElement>) {
	const [scrollPosition, setScrollPosition] = useState(0);

	function handleDocumentScroll() {
		const { scrollTop: currentScrollTop } =
			ref.current || document.documentElement || document.body;

		setScrollPosition(() => {
			return currentScrollTop;
		});

		// if (callback) callback({ previousScrollTop, currentScrollTop });
	}

	const handleDocumentScrollThrottled = lib.lodash.throttle(handleDocumentScroll, 250);

	useEffect(() => {
		const current = ref.current !== undefined && ref.current !== null ? ref.current : document;
		current.addEventListener('scroll', handleDocumentScrollThrottled);

		return () => current.removeEventListener('scroll', handleDocumentScrollThrottled);
		// LOGIC CHANGE
	}, [ref, handleDocumentScrollThrottled]);

	return scrollPosition;
}

export default useScrollPosition;
