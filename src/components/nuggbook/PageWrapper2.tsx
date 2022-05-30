import React, { FC, PropsWithChildren } from 'react';
import { animated, config, useTransition } from '@react-spring/web';

import client from '@src/client';
import lib from '@src/lib';
import { Page } from '@src/interfaces/nuggbook';
import useOnClickOutside from '@src/hooks/useOnClickOutside';
import usePrevious from '@src/hooks/usePrevious';
import MobileStatus from '@src/components/mobile/MobileStatus';
import ConnectTab from '@src/components/nugg/Wallet/tabs/ConnectTab/ConnectTab';
import { AllItems, AllNuggs } from '@src/components/mobile/NuggDexSearchListMobile2';
import NuggDexSearchBarMobile from '@src/components/mobile/NuggDexSearchBarMobile';

import Start from './pages/Start';
import Welcome from './pages/Welcome';
import TableOfContents from './pages/TableOfContents';
import WhatIsAWallet from './pages/WhatIsAWallet';
import Close from './pages/Close';
import TheRundown from './pages/1-the-rundown/TheRundown';
import Setup_0 from './pages/set-up/Setup_0';
import Setup_1 from './pages/set-up/Setup_1';
import Setup_2 from './pages/set-up/Setup_2';
import Setup_3 from './pages/set-up/Setup_3';
import HelpingTest_0 from './pages/helping-test/HelpingTest_0';
import Feedback from './pages/helping-test/Feedback';

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
        case Page.Feedback:
            return { top: 100, comp: Feedback, page };
        case Page.HelpingTest_0:
            return { top: 100, comp: HelpingTest_0, page };
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
        case Page.Status:
            return { top: 100, comp: MobileStatus, page };
        case Page.Connect:
            return { top: 100, comp: React.memo(() => <ConnectTab />), page };
        case Page.Search:
            return { top: 100, comp: React.memo(() => <NuggDexSearchBarMobile />), page };
        case Page.AllItems:
            return { top: 100, comp: React.memo(() => <AllItems />), page };
        case Page.AllNuggs:
            return { top: 100, comp: React.memo(() => <AllNuggs />), page };
        default:
            return { top: 1000, comp: Close, page };
    }
};

const useNuggBookHandler = () => {
    const close = client.nuggbook.useCloseNuggBook();
    const setPage = client.nuggbook.useOpenNuggBook();

    const visits = client.nuggbook.useVisits();
    const goto = client.nuggbook.useGoto();

    const [, startTransiton] = React.useTransition();

    // this triggers for people who have have not seen it
    React.useEffect(() => {
        if (visits && !visits[Page.Start]) {
            setPage(Page.Start);
        }
    }, [visits, setPage]);

    const handleClose = React.useCallback(() => {
        // setVisit(Page.Start);
        startTransiton(close);
    }, [close, startTransiton]);

    const handleVisit = React.useCallback(
        (_page: Page, direction?: boolean) => {
            // setVisit(_page);
            goto(_page, direction);

            startTransiton(() => setPage(_page));
        },
        [startTransiton, goto, setPage],
    );

    const handleClear = React.useCallback(() => {
        window.localStorage.removeItem('nugg.xyz-nuggbook');
        startTransiton(() => window.location.reload());
    }, [startTransiton]);

    return { handleClear, handleClose, handleVisit, visits };
};

const NuggBookPageWrapper2: FC<PropsWithChildren<unknown>> = () => {
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
                transform: `translate(${direction ? 1000 : -1000}px,0px)`,
            }),

            enter: { pointerEvents: 'auto', transform: `translate(0px,0px)` },
            leave: () => ({
                transform: `translate(${direction ? -1000 : 1000}px,0px)`,
            }),
            keys: (item) => `AtabFadeTransition${item.book.page}`,
            config: config.default,
        },
        [yep, direction],
    );

    const node = React.useRef<HTMLDivElement>(null);

    useOnClickOutside(node, handleClose);

    return (
        <animated.div
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                justifyContent: 'flex-start',
                flexDirection: 'column',
            }}
        >
            <animated.div
                ref={node}
                style={{
                    height: '100%',
                    width: '100%',
                    borderTopLeftRadius: lib.layout.borderRadius.largish,
                    borderTopRightRadius: lib.layout.borderRadius.largish,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <animated.div
                    style={{
                        height: '100%',
                        width: '100%',
                        justifyContent: 'flex-start',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                    }}
                >
                    <animated.div
                        style={{
                            height: '100%',
                            overflow: 'scroll',
                        }}
                    >
                        {tabFadeTransition((_styles, kid) => (
                            <>
                                <animated.div
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        position: 'absolute',
                                        ..._styles,
                                        overflow: 'scroll',
                                        opacity: 1,
                                        left: 0,
                                        right: 0,
                                        pointerEvents: 'auto',
                                        height: '100%',
                                        // maxHeight: height - book.top,
                                        paddingBottom: 100,
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
                            </>
                        ))}
                    </animated.div>
                </animated.div>
            </animated.div>
        </animated.div>
    );
};

export default React.memo(NuggBookPageWrapper2);
