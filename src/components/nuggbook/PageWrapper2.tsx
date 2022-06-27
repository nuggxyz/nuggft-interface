import React, { FC, PropsWithChildren } from 'react';
import { animated, config, useTransition } from '@react-spring/web';
import { t } from '@lingui/macro';

import client from '@src/client';
import lib from '@src/lib';
import { Page, NuggBookPage } from '@src/interfaces/nuggbook';
import MobileStatus from '@src/components/mobile/MobileStatus';
import ConnectTab from '@src/components/nugg/Wallet/tabs/ConnectTab/ConnectTab';
import { AllItems, AllNuggs } from '@src/components/mobile/NuggDexSearchListMobile2';
import NuggDexSearchBarMobile from '@src/components/mobile/NuggDexSearchBarMobile';
import web3 from '@src/web3';
import MobileWallet from '@src/components/mobile/MobileWallet';

import Start from './pages/Start';
import TableOfContents from './pages/TableOfContents';
import WhatIsAWallet from './pages/WhatIsAWallet';
import Close from './pages/Close';
import Setup_0 from './pages/set-up/Setup_0';
import Setup_1 from './pages/set-up/Setup_1';
import Setup_2 from './pages/set-up/Setup_2';
import Setup_3 from './pages/set-up/Setup_3';
import HelpingTest_0 from './pages/helping-test/HelpingTest_0';
import Feedback from './pages/helping-test/Feedback';
import Rundown_0 from './pages/1-the-rundown/Rundown_0';
import Rundown_1 from './pages/1-the-rundown/Rundown_1';
import Rundown_2 from './pages/1-the-rundown/Rundown_2';
import Rundown_3 from './pages/1-the-rundown/Rundown_3';
import Rundown_4 from './pages/1-the-rundown/Rundown_4';
import Rundown_5 from './pages/1-the-rundown/Rundown_5';
import Rundown_6 from './pages/1-the-rundown/Rundown_6';
import Rundown_7 from './pages/1-the-rundown/Rundown_7';
import Rundown_8 from './pages/1-the-rundown/Rundown_8';
import Rundown_9 from './pages/1-the-rundown/Rundown_9';
import Rundown_10 from './pages/1-the-rundown/Rundown_10';
import Tldr_0 from './pages/tldr/Tldr_0';
import Tldr_1 from './pages/tldr/Tldr_1';
import Tldr_2 from './pages/tldr/Tldr_2';
import Tldr_3 from './pages/tldr/Tldr_3';
import Tldr_4 from './pages/tldr/Tldr_4';
import Tldr_5 from './pages/tldr/Tldr_5';

const MemoizedWallet = React.memo(() => {
    const address = web3.hook.usePriorityAccount();
    return address ? <MobileWallet /> : <ConnectTab />;
});

const useNuggBook = (): {
    top: number;
    comp: NuggBookPage;
    page: Page;
    nextButton?: {
        text: string;
        goto: Page;
    };
} => {
    const page = client.nuggbook.useNuggBookPage();

    return React.useMemo(() => {
        switch (page) {
            case Page.Start:
                return { top: 450, comp: Start, page };
            case Page.Welcome:
                return { top: 100, comp: Tldr_0, page };
            case Page.Tldr_1:
                return {
                    top: 100,
                    comp: Tldr_1,
                    page,
                    nextButton: {
                        text: t`next`,
                        goto: Page.Tldr_2,
                    },
                };
            case Page.Tldr_2:
                return {
                    top: 100,
                    comp: Tldr_2,
                    page,
                    nextButton: {
                        text: t`next`,
                        goto: Page.Tldr_3,
                    },
                };
            case Page.Tldr_3:
                return {
                    top: 100,
                    comp: Tldr_3,
                    page,
                    nextButton: {
                        text: t`next`,
                        goto: Page.Tldr_4,
                    },
                };

            case Page.Tldr_4:
                return {
                    top: 100,
                    comp: Tldr_4,
                    page,
                    nextButton: {
                        text: t`next`,
                        goto: Page.Tldr_5,
                    },
                };
            case Page.Tldr_5:
                return {
                    top: 100,
                    comp: Tldr_5,
                    page,
                    nextButton: {
                        text: t`keep reading`,
                        goto: Page.TableOfContents,
                    },
                };
            case Page.TableOfContents:
                return { top: 100, comp: TableOfContents, page };
            case Page.WhatIsAWallet:
                return { top: 100, comp: WhatIsAWallet, page };
            case Page.Feedback:
                return { top: 100, comp: Feedback, page };
            case Page.HelpingTest_0:
                return { top: 100, comp: HelpingTest_0, page };
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
            case Page.Status:
                return { top: 100, comp: MobileStatus as NuggBookPage, page };
            case Page.Connect:
                return {
                    top: 100,
                    comp: MemoizedWallet,
                    page,
                };
            case Page.Search:
                return { top: 100, comp: NuggDexSearchBarMobile as NuggBookPage, page };
            case Page.AllItems:
                return { top: 100, comp: AllItems as NuggBookPage, page };
            case Page.AllNuggs:
                return { top: 100, comp: AllNuggs as NuggBookPage, page };
            default:
                return { top: 1000, comp: Close, page };
        }
    }, [page]);
};

const useNuggBookHandler = () => {
    const close = client.nuggbook.useCloseNuggBook();
    const setPage = client.nuggbook.useOpenNuggBook();

    const visits = client.nuggbook.useVisits();
    const goto = client.nuggbook.useGoto();

    // this triggers for people who have have not seen it
    React.useEffect(() => {
        if (visits && !visits[Page.Start]) {
            setPage(Page.Start);
        }
    }, [visits, setPage]);

    const handleClose = React.useCallback(() => {
        // setVisit(Page.Start);
        close();
    }, [close]);

    const handleVisit = React.useCallback(
        (_page: Page, direction?: boolean) => {
            // setVisit(_page);
            goto(_page, direction);

            // (() => setPage(_page));
        },
        [goto, setPage],
    );

    const handleClear = React.useCallback(() => {
        window.localStorage.removeItem('nugg.xyz-nuggbook');
        void window.location.reload();
    }, []);

    return [handleClear, handleClose, handleVisit, visits] as const;
};

const NuggBookPageWrapper2: FC<PropsWithChildren<unknown>> = () => {
    const book = useNuggBook();

    const [handleClear, handleClose, handleVisit] = useNuggBookHandler();
    const direction = client.nuggbook.useDirection();

    const [tabFadeTransition] = useTransition(
        book,
        {
            initial: {
                transform: `translate(0px,0px)`,
            },
            from: () => ({
                transform: `translate(${direction ? 1000 : -1000}px,0px)`,
            }),

            enter: { transform: `translate(0px,0px)` },
            leave: () => ({
                transform: `translate(${direction ? -1000 : 1000}px,0px)`,
            }),
            keys: (item) => `AtabFadeTransition${item.page}`,
            config: config.default,
        },
        [book, direction],
    );

    const node = React.useRef<HTMLDivElement>(null);

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                justifyContent: 'flex-start',
                flexDirection: 'column',
            }}
        >
            <div
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
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        justifyContent: 'flex-start',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                    }}
                >
                    <div
                        style={{
                            height: '100%',
                            overflow: 'scroll',
                            position: 'relative',
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
                                        paddingBottom: 100,
                                    }}
                                >
                                    {!!kid.comp && (
                                        <kid.comp
                                            clear={handleClear}
                                            close={handleClose}
                                            setPage={handleVisit}
                                        />
                                    )}
                                </animated.div>
                                {kid.nextButton && (
                                    <div
                                        className="mobile-pressable-div"
                                        style={{
                                            alignItems: 'center',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            // padding: 10,
                                            bottom: 0,
                                            left: 15,
                                            pointerEvents: 'auto',
                                            position: 'absolute',
                                            color: lib.colors.white,
                                            boxShadow: lib.layout.boxShadow.basic,
                                            padding: '.7rem 1.3rem',
                                            background: lib.colors.gradient3,
                                            borderRadius: lib.layout.borderRadius.large,
                                            marginBottom: 15,
                                            zIndex: 5000000000,
                                        }}
                                        role="button"
                                        aria-hidden="true"
                                        onClick={() => {
                                            handleVisit(kid.nextButton!.goto, true);
                                        }}
                                    >
                                        <span style={{ ...lib.layout.presets.font.main.thicc }}>
                                            {kid.nextButton.text}
                                        </span>
                                    </div>
                                )}
                            </>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(NuggBookPageWrapper2);
