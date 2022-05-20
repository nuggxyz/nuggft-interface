import React, { FC } from 'react';

import NavigationBar from '@src/components/nugg/PageLayout/NavigationBar/NavigationBar';
import NavigationBarMobile from '@src/components/mobile/NavigationBarMobile';
import useDimensions from '@src/client/hooks/useDimensions';

const NavigationWrapper: FC<unknown> = () => {
    const { screen: screenType } = useDimensions();

    return screenType === 'phone' ? (
        <>
            <NavigationBarMobile />
        </>
    ) : (
        <>
            <NavigationBar />
        </>
    );
};
export default React.memo(NavigationWrapper);
