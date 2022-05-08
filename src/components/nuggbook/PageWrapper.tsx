import React, { FC, PropsWithChildren, useEffect } from 'react';
import { animated, config, useSpring, useTransition } from '@react-spring/web';

import client from '@src/client';
import useAnimateOverlayBackdrop from '@src/hooks/useAnimateOverlayBackdrop';
import lib from '@src/lib';
import { Page } from '@src/interfaces/nuggbook';
import useOnClickOutside from '@src/hooks/useOnClickOutside';
import useLocalStorage from '@src/hooks/useLocaleStorage';
import useDimensions from '@src/client/hooks/useDimensions';
import BackButton from '@src/components/mobile/BackButton';

import Start from './pages/Start';
import Welcome from './pages/Welcome';
import TableOfContents from './pages/TableOfContents';
import WhatIsAWallet from './pages/WhatIsAWallet';
import WhatIsAnNFT from './pages/WhatIsAnNFT';
import WhatIsDefi from './pages/WhatIsDefi';

const useNuggBook = () => {
    const page = client.nuggbook.useNuggBookPage();

    switch (page) {
        case Page.Start:
            return { top: 450, comp: Start, page };
        case Page.Welcome:
            return { top: 200, comp: Welcome, page };
        case Page.TableOfContents:
            return { top: 100, comp: TableOfContents, page };
        case Page.WhatIsAWallet:
            return { top: 100, comp: WhatIsAWallet, page };
        case Page.WhatIsAnNFT:
            return { top: 100, comp: WhatIsAnNFT, page };
        case Page.WhatIsDefi:
            return { top: 100, comp: WhatIsDefi, page };
        case Page.Close:
        default:
            return { top: 1000, comp: null, page };
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
        window.localStorage.removeItem('nugg-book');
        startTransiton(() => window.location.reload());
    }, [startTransiton]);

    return { handleClear, handleClose, handleVisit, visits };
};

const BOTTOM_OFFSET = 500;

const Modal: FC<PropsWithChildren<unknown>> = () => {
    const book = useNuggBook();

    const { handleClear, handleClose, handleVisit } = useNuggBookHandler();

    const [draggedTop, setDraggedTop] = React.useState<number>(book.top);

    useEffect(() => {
        setDraggedTop(book.top);
    }, [book.top]);

    const dim = useDimensions();

    const containerStyle = useSpring({
        from: {
            top: 1000,
        },
        to: {
            top: draggedTop,
        },
        config: config.gentle,
    });

    const style: CSSPropertiesAnimated = useAnimateOverlayBackdrop(book.page !== Page.Close);

    const tabFadeTransition = useTransition(book, {
        initial: {
            opacity: 0,
            zIndex: 0,
            left: 0,
        },
        from: (page) => ({
            opacity: 0,
            zIndex: 0,
            left: page.page === Page.TableOfContents ? -1000 : 1000,
        }),
        enter: { opacity: 1, left: 0, right: 0, pointerEvents: 'auto' },
        leave: (page) => ({
            opacity: 0,
            zIndex: 0,
            left: page.page === Page.TableOfContents ? -1000 : 1000,
        }),
        keys: (item) => `tabFadeTransition${item.page}`,
        config: config.stiff,
    });

    const node = React.useRef<HTMLDivElement>(null);

    useOnClickOutside(node, handleClose);

    return (
        <animated.div
            style={{
                ...style,
                height: '100%',
                width: '100%',
                justifyContent: 'flex-end',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 200000,
            }}
        >
            <animated.div
                ref={node}
                draggable="true"
                onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', 'draggable');
                }}
                onDrag={(event) => {
                    event.preventDefault();
                    setDraggedTop(event.clientY);
                    if (event.clientY > book.top + 300) handleClose();
                }}
                onDragEnd={() => {
                    setDraggedTop(book.top);
                }}
                style={{
                    ...containerStyle,
                    width: '100%',
                    background: lib.colors.white,
                    borderTopLeftRadius: lib.layout.borderRadius.largish,
                    borderTopRightRadius: lib.layout.borderRadius.largish,
                    position: 'absolute',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    height: dim.height + BOTTOM_OFFSET,

                    // paddingBottom: BOTTOM_OFFSET,
                }}
            >
                <div
                    style={{
                        height: dim.height - book.top,
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
                        }}
                    >
                        {tabFadeTransition((_styles, kid) => (
                            <>
                                <animated.div
                                    style={{
                                        width: '100%',
                                        padding: '25px',
                                        position: 'absolute',
                                        ..._styles,
                                        overflow: 'scroll',

                                        maxHeight: dim.height - book.top,
                                    }}
                                >
                                    {!!kid.comp &&
                                        kid.comp({
                                            clear: handleClear,
                                            close: handleClose,
                                            setPage: handleVisit,
                                        })}
                                </animated.div>
                            </>
                        ))}
                        <BackButton noNavigate onClick={() => handleClose()} />

                        <div
                            style={{
                                position: 'absolute',
                                left: 0,
                                width: '20%',
                                top: 0,
                                height: '100%',
                            }}
                        />
                    </div>
                </div>
            </animated.div>
        </animated.div>
    );
};

export default React.memo(Modal);
