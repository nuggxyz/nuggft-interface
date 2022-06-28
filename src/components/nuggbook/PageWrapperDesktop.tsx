import React, { FunctionComponent, useMemo } from 'react';
import { animated, config, useTransition } from '@react-spring/web';

import client from '@src/client';
import { Page } from '@src/interfaces/nuggbook';
import usePrevious from '@src/hooks/usePrevious';
import useDimensions from '@src/client/hooks/useDimensions';

import Start from './pages/Start';
import Welcome from './pages/Welcome';
import TableOfContents from './pages/TableOfContents';
import WhatIsAWallet from './pages/WhatIsAWallet';
import WhatIsAnNFT from './pages/WhatIsAnNFT';
import WhatIsDefi from './pages/WhatIsDefi';
import Close from './pages/Close';
import Setup_0 from './pages/set-up/Setup_0';
import Setup_1 from './pages/set-up/Setup_1';
import Setup_2 from './pages/set-up/Setup_2';
import Setup_3 from './pages/set-up/Setup_3';
import Rundown_0 from './pages/1-the-rundown/Rundown_0';
import Rundown_1 from './pages/1-the-rundown/Rundown_1';
import Rundown_2 from './pages/1-the-rundown/Rundown_2';
import Rundown_3 from './pages/1-the-rundown/Rundown_3';
import Rundown_4 from './pages/1-the-rundown/Rundown_4';
import Rundown_5 from './pages/1-the-rundown/Rundown_5';
import Rundown_10 from './pages/1-the-rundown/Rundown_10';
import Rundown_9 from './pages/1-the-rundown/Rundown_9';
import Rundown_8 from './pages/1-the-rundown/Rundown_8';
import Rundown_7 from './pages/1-the-rundown/Rundown_7';
import Rundown_6 from './pages/1-the-rundown/Rundown_6';
import Tldr_2 from './pages/tldr/Tldr_2';
import Tldr_1 from './pages/tldr/Tldr_1';
import Tldr_3 from './pages/tldr/Tldr_3';
import Tldr_4 from './pages/tldr/Tldr_4';
import Tldr_5 from './pages/tldr/Tldr_5';

const useNuggBook = () => {
    const page = client.nuggbook.useNuggBookPage();

    switch (page) {
        case Page.Start:
            return { top: 450, comp: Start, page };
        case Page.Welcome:
            return { top: 100, comp: Welcome, page };
        case Page.Tldr_1:
            return { top: 100, comp: Tldr_1, page };
        case Page.Tldr_2:
            return { top: 100, comp: Tldr_2, page };
        case Page.Tldr_3:
            return { top: 100, comp: Tldr_3, page };
        case Page.Tldr_4:
            return { top: 100, comp: Tldr_4, page };
        case Page.Tldr_5:
            return { top: 100, comp: Tldr_5, page };
        case Page.TableOfContents:
            return { top: 100, comp: TableOfContents, page };
        case Page.WhatIsAWallet:
            return { top: 100, comp: WhatIsAWallet, page };
        case Page.WhatIsAnNFT:
            return { top: 100, comp: WhatIsAnNFT, page };
        case Page.WhatIsDefi:
            return { top: 100, comp: WhatIsDefi, page };
        case Page.Rundown_0:
            return { top: 100, comp: Rundown_0, page };
        case Page.Rundown_1:
            return { top: 100, comp: Rundown_1, page };
        case Page.Rundown_2:
            return { top: 100, comp: Rundown_2, page };
        case Page.Rundown_3:
            return { top: 100, comp: Rundown_3, page };
        case Page.Rundown_4:
            return { top: 100, comp: Rundown_4, page };
        case Page.Rundown_5:
            return { top: 100, comp: Rundown_5, page };
        case Page.Rundown_6:
            return { top: 100, comp: Rundown_6, page };
        case Page.Rundown_7:
            return { top: 100, comp: Rundown_7, page };
        case Page.Rundown_8:
            return { top: 100, comp: Rundown_8, page };
        case Page.Rundown_9:
            return { top: 100, comp: Rundown_9, page };
        case Page.Rundown_10:
            return { top: 100, comp: Rundown_10, page };
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
        (_page: Page, _direction?: boolean) => {
            setVisit(_page);
            startTransiton(() => setPage(_page, _direction));
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
    const { height } = useDimensions();
    const wrapperHeight = useMemo(() => height / 1.5, [height]);

    const [yep, setYep] = React.useState({ book, direction });
    const prevYep = usePrevious(yep);

    React.useEffect(() => {
        if (yep.book.page !== book.page) {
            setYep({ book, direction });
        }
    }, [book, direction, setYep, prevYep?.book.page, yep.book.page, yep]);

    // console.log(yep);

    const [tabFadeTransition] = useTransition(
        yep,
        {
            initial: {
                transform: `translate(0px,0px)`,
            },
            from: () => ({
                transform: `translate(${!yep.direction ? -1000 : 1000}px,0px)`,
            }),
            enter: { pointerEvents: 'auto', transform: `translate(0px,0px)` },
            leave: () => ({
                transform: `translate(${yep.direction ? -1000 : 1000}px,0px)`,
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
                height: wrapperHeight,
            }}
        >
            {tabFadeTransition((_styles, kid) => (
                <animated.div
                    style={{
                        ..._styles,
                        position: 'absolute',
                        width: '80%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
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
