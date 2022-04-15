import React from 'react';

import client from '@src/client';
import useDimentions from '@src/client/hooks/useDimentions';
import { Page } from '@src/interfaces/nuggbook';

import PageWrapper from './PageWrapper';
import Start from './pages/Start';
import Welcome from './pages/Welcome';

const useNuggBook = (page: Page) => {
    switch (page) {
        case Page.Start:
            return { top: 450, comp: Start };
        case Page.Welcome:
            return { top: 200, comp: Welcome };
        case Page.Close:
        default:
            return { top: 1000, comp: null };
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

    const { comp: Comp, top } = useNuggBook(page);

    const { isPhone } = useDimentions();

    return isPhone ? (
        <PageWrapper top={top} close={closeit}>
            {Comp && <Comp setPage={setPage} close={closeit} />}
        </PageWrapper>
    ) : null;
};
