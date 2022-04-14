import React from 'react';

import client from '@src/client';
import useDimentions from '@src/client/hooks/useDimentions';

import PageWrapper from './PageWrapper';
import Start from './pages/Start';
import Welcome from './pages/Welcome';
import { Page } from '@src/interfaces/nuggbook';

const useNuggBook = (page: Page) => {
    switch (page) {
        case Page.Start:
            return { top: 450, height: 400, comp: React.memo(Start) };
        case Page.Welcome:
            return { top: 200, height: 900, comp: React.memo(Welcome) };
        case Page.Close:
        default:
            return { top: 1000, height: 500, comp: null };
    }
};

export default () => {
    const page = client.nuggbook.useNuggBookPage();

    const close = client.nuggbook.useCloseNuggBook();
    const setPage = client.nuggbook.useSetNuggBookPage();

    const [, startTransiton] = React.useTransition();

    const closeit = React.useCallback(() => {
        startTransiton(close);
    }, [close, startTransiton]);

    const { comp: Comp, top, height } = useNuggBook(page);

    const { isPhone } = useDimentions();

    return isPhone ? (
        <PageWrapper height={height} top={top}>
            {Comp && <Comp setPage={setPage} close={closeit} />}
        </PageWrapper>
    ) : null;
};
