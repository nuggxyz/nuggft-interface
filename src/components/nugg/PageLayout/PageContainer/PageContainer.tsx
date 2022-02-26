import React, { FC, ReactChild } from 'react';

import NavigationBar from '@src/components/nugg/PageLayout/NavigationBar/NavigationBar';

type Props = {
    children: ReactChild | ReactChild[];
    showBackButton?: boolean;
};

const PageContainer: FC<Props> = ({ children }) => {
    return (
        <>
            <NavigationBar />
            {children}
        </>
    );
};
export default React.memo(PageContainer);
