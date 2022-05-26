import React, { FunctionComponent } from 'react';
import { animated, config, useTransition } from '@react-spring/web';

import client from '@src/client';
import { Page } from '@src/interfaces/nuggbook';

import Start from './pages/Start';
import Welcome from './pages/Welcome';
import TableOfContents from './pages/TableOfContents';
import WhatIsAWallet from './pages/WhatIsAWallet';
import WhatIsAnNFT from './pages/WhatIsAnNFT';
import WhatIsDefi from './pages/WhatIsDefi';
import Close from './pages/Close';
import TheRundown from './pages/1-the-rundown/TheRundown';
import SetUpAWallet from './pages/1-the-rundown/SetUpAWallet';

const useNuggBook = () => {
    const page = client.nuggbook.useNuggBookPage();

    switch (page) {
        case Page.Start:
            return { top: 450, comp: Start, page };
        case Page.Welcome:
            return { top: 100, comp: Welcome, page };
        case Page.TableOfContents:
            return { top: 100, comp: TableOfContents, page };
        case Page.WhatIsAWallet:
            return { top: 100, comp: WhatIsAWallet, page };
        case Page.WhatIsAnNFT:
            return { top: 100, comp: WhatIsAnNFT, page };
        case Page.WhatIsDefi:
            return { top: 100, comp: WhatIsDefi, page };
        case Page.TheRundown:
            return { top: 100, comp: TheRundown, page };
        case Page.SetUpAWallet:
            return { top: 100, comp: SetUpAWallet, page };
        default:
            return { top: 1000, comp: Close, page };
    }
};
const useNuggBookHandler = () => {
    const close = client.nuggbook.useCloseNuggBook();
    const setPage = client.nuggbook.useOpenNuggBook();

    const visits = client.nuggbook.useVisits();
    const setVisit = client.nuggbook.useSetVisit();

    const [, startTransiton] = React.useTransition();

    // this triggers for people who have have not seen it
    React.useEffect(() => {
        if (visits && !visits[Page.Start]) {
            setPage(Page.Start);
        }
    }, [visits, setPage]);

    const handleClose = React.useCallback(() => {
        setVisit(Page.Start);
        startTransiton(close);
    }, [close, startTransiton, setVisit]);

    const handleVisit = React.useCallback(
        (_page: Page) => {
            setVisit(_page);
            startTransiton(() => setPage(_page));
        },
        [startTransiton, setVisit, setPage],
    );

    const handleClear = React.useCallback(() => {
        window.localStorage.removeItem('nugg.xyz-nuggbook');
        startTransiton(() => window.location.reload());
    }, [startTransiton]);

    return { handleClear, handleClose, handleVisit, visits };
};

type Props = Record<string, never>;

const PageWrapperDesktop: FunctionComponent<Props> = () => {
    const book = useNuggBook();
    const { handleClear, handleClose, handleVisit } = useNuggBookHandler();

    const tabFadeTransition = useTransition(book, {
        initial: {
            transform: `translate(0px,0px)`,
        },
        from: (page) => ({
            transform: `translate(${page.page === Page.TableOfContents ? -1000 : 1000}px,0px)`,
        }),
        // enter: { opacity: 1, left: 0, right: 0, pointerEvents: 'auto' },
        enter: { pointerEvents: 'auto', transform: `translate(0px,0px)` },
        leave: (page) => ({
            transform: `translate(${page.page === Page.TableOfContents ? -1000 : 1000}px,0px)`,
        }),
        keys: (item) => `AtabFadeTransition${item.page}`,
        config: config.default,
    });
    return (
        <div
            style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'scroll',
                height: '100%',
                position: 'relative',
            }}
        >
            {tabFadeTransition((_styles, kid) => (
                <animated.div style={{ ..._styles, position: 'absolute' }}>
                    {!!kid.comp && (
                        <kid.comp clear={handleClear} close={handleClose} setPage={handleVisit} />
                    )}
                </animated.div>
            ))}
        </div>
    );
};

export default PageWrapperDesktop;
