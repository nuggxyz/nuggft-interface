import React, { FunctionComponent } from 'react';
import { animated, config, useTransition } from '@react-spring/web';

import client from '@src/client';
import { Page } from '@src/interfaces/nuggbook';
import usePrevious from '@src/hooks/usePrevious';

import Start from './pages/Start';
import Welcome from './pages/Welcome';
import TableOfContents from './pages/TableOfContents';
import WhatIsAWallet from './pages/WhatIsAWallet';
import WhatIsAnNFT from './pages/WhatIsAnNFT';
import WhatIsDefi from './pages/WhatIsDefi';
import Close from './pages/Close';
import TheRundown from './pages/1-the-rundown/TheRundown';
import Setup_0 from './pages/set-up/Setup_0';
import Setup_1 from './pages/set-up/Setup_1';
import Setup_2 from './pages/set-up/Setup_2';
import Setup_3 from './pages/set-up/Setup_3';

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
        case Page.Setup_0:
            return { top: 100, comp: Setup_0, page };
        case Page.Setup_1:
            return { top: 100, comp: Setup_1, page };
        case Page.Setup_2:
            return { top: 100, comp: Setup_2, page };
        case Page.Setup_3:
            return { top: 100, comp: Setup_3, page };
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
    const direction = client.nuggbook.useDirection();

    const [yep, setYep] = React.useState({ book, direction });
    const prevYep = usePrevious(yep);

    React.useEffect(() => {
        if (yep.book.page !== book.page) {
            setYep({ book, direction });
        }
    }, [book, direction, setYep, prevYep?.book.page, yep.book.page, yep]);

    const [tabFadeTransition] = useTransition(
        yep,
        {
            initial: {
                transform: `translate(0px,0px)`,
            },
            from: () => ({
                transform: `translate(${direction ? -1000 : 1000}px,0px)`,
            }),
            // enter: { opacity: 1, left: 0, right: 0, pointerEvents: 'auto' },
            enter: { pointerEvents: 'auto', transform: `translate(0px,0px)` },
            leave: () => ({
                transform: `translate(${direction ? -1000 : 1000}px,0px)`,
            }),
            keys: (item) => `AtabFadeTransition${item.book.page}`,
            config: config.default,
        },
        [yep, direction],
    );
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
                    {!!kid.book.comp && (
                        <kid.book.comp
                            clear={handleClear}
                            close={handleClose}
                            setPage={handleVisit}
                        />
                    )}
                </animated.div>
            ))}
        </div>
    );
};

export default PageWrapperDesktop;
