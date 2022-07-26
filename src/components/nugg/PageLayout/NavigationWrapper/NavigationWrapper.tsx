import React from 'react';

import NavigationBar from '@src/components/nugg/PageLayout/NavigationBar/NavigationBar';
import NavigationBarMobile from '@src/components/mobile/NavigationBarMobile';

const NavigationWrapper = React.memo<{ isPhone: boolean }>(
	({ isPhone }) => {
		return isPhone ? <NavigationBarMobile /> : <NavigationBar />;
	},
	(a, b) => a.isPhone === b.isPhone,
);

export default NavigationWrapper;
