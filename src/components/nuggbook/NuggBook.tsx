import React from 'react';

import client from '@src/client';
import useDimentions from '@src/client/hooks/useDimentions';
import { initialNuggBookLocalStorage, Page } from '@src/interfaces/nuggbook';
import useLocalStorage from '@src/hooks/useLocaleStorage';

import PageWrapper from './PageWrapper';
import Start from './pages/Start';
import Welcome from './pages/Welcome';
import TableOfContents from './pages/TableOfContents';
import WhatIsAWallet from './pages/WhatIsAWallet';
import WhatIsAnNFT from './pages/WhatIsAnNFT';
import WhatIsDefi from './pages/WhatIsDefi';

const useNuggBook = (page: Page) => {
    switch (page) {
        case Page.Start:
            return { top: 450, comp: Start };
        case Page.Welcome:
            return { top: 200, comp: Welcome };
        case Page.TableOfContents:
            return { top: 100, comp: TableOfContents };
        case Page.WhatIsAWallet:
            return { top: 100, comp: WhatIsAWallet };
        case Page.WhatIsAnNFT:
            return { top: 100, comp: WhatIsAnNFT };
        case Page.WhatIsDefi:
            return { top: 100, comp: WhatIsDefi };
        case Page.Close:
        default:
            return { top: 1000, comp: null };
    }
};

export default () => {
    const page = client.nuggbook.useNuggBookPage();

    const close = client.nuggbook.useCloseNuggBook();
    const setPage = client.nuggbook.useOpenNuggBook();

    const [, startTransiton] = React.useTransition();

    const { comp: Comp, top } = useNuggBook(page);

    const { isPhone } = useDimentions();

    const { value, setKey } = useLocalStorage('nugg-book', initialNuggBookLocalStorage);

    const closeit = React.useCallback(
        (removeLocalStorage = false) => {
            if (removeLocalStorage) {
                window.localStorage.removeItem('nugg-book');
            } else {
                setKey(Page.Start, true);
            }
            startTransiton(close);
        },
        [close, startTransiton, setKey],
    );

    const visitit = React.useCallback(
        (_page: Page) => {
            setKey(_page, true);
            startTransiton(() => setPage(_page));
        },
        [startTransiton, setKey, setPage],
    );

    const clearit = React.useCallback(() => {
        window.localStorage.removeItem('nugg-book');
        startTransiton(() => window.location.reload());
    }, [startTransiton]);

    // this triggers for people who have have not seen it
    React.useEffect(() => {
        if (value && !value[Page.Start]) {
            setPage(Page.Start);
        }
    }, [value, setPage]);

    return isPhone ? (
        <PageWrapper top={top} close={closeit}>
            {Comp && <Comp setPage={visitit} close={closeit} visits={value} clear={clearit} />}
        </PageWrapper>
    ) : null;
};
