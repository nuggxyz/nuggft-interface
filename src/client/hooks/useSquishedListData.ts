import React from 'react';

const useSquishedListData = <G>(data: G[]): [G | undefined, G | undefined][] => {
	return React.useMemo(() => {
		const abc: [G | undefined, G | undefined][] = [];
		for (let i = 0; i < data.length; i += 2) {
			const tmp: [G | undefined, G | undefined] = [undefined, undefined];
			tmp[0] = data[i];
			if (i + 1 < data.length) tmp[1] = data[i + 1];
			abc.push(tmp);
		}
		return abc;
	}, [data]);
};

export default useSquishedListData;
