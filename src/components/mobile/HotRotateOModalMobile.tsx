/* eslint-disable react/jsx-props-no-spreading */
import React, { FC } from 'react';
import { animated, config, useSpring, useTransition } from '@react-spring/web';
import { IoChevronBackCircle, IoArrowUpCircle, IoArrowDownCircle } from 'react-icons/io5';
import { HiArrowCircleUp } from 'react-icons/hi';

import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import client from '@src/client';
import NLStaticImage from '@src/components/general/NLStaticImage';
import TransactionVisualConfirmation from '@src/components/nugg/TransactionVisualConfirmation';
import {
    HotRotateOItem,
    useHotRotateO,
    HotRotateOItemList,
} from '@src/pages/hot-rotate-o/HotRotateO';
import { RotateOModalData } from '@src/interfaces/modals';
import { GodListRenderItemProps } from '@src/components/general/List/GodList';
import eth from '@src/assets/images/app_logos/eth.png';

const RenderItemMobileTiny2: FC<
    GodListRenderItemProps<
        (HotRotateOItem | undefined)[],
        undefined,
        HotRotateOItemList['byItem'][number][number]
    >
> = ({ item, action }) => {
    return (
        <div>
            {(item ?? []).map((x, index) => (
                <RenderItemMobileTiny item={x} action={action} index={index} />
            ))}
        </div>
    );
};
const RenderItemMobileTiny: FC<
    GodListRenderItemProps<HotRotateOItem, undefined, HotRotateOItem>
> = ({ item, action, index }) => {
    return (
        <div
            className="mobile-pressable-div"
            role="button"
            aria-hidden="true"
            onClick={() => action && action(item)}
            style={{
                borderRadius: lib.layout.borderRadius.largish,
                overflowY: 'visible',
                width: '80px',
                height: '100%',
            }}
        >
            <div
                style={{
                    borderRadius: lib.layout.borderRadius.medium,
                    transition: '.2s background ease',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 10,
                }}
            >
                {item === undefined && index === 0 ? (
                    <div
                        style={{
                            height: '45px',
                            width: '45px',
                            borderRadius: lib.layout.borderRadius.mediumish,
                            background: lib.colors.transparentWhite,
                        }}
                    />
                ) : (
                    <TokenViewer
                        forceCache
                        tokenId={item?.tokenId}
                        style={{ width: '60px', height: '60px', padding: '3px' }}
                        disableOnClick
                    />
                )}

                {item?.feature !== 0 &&
                    item &&
                    (index !== 0 ? (
                        <IoArrowUpCircle
                            color={lib.colors.transparentGreen}
                            style={{
                                position: 'absolute',
                                top: 5,
                                right: 5,
                                zIndex: 2,
                                WebkitBackdropFilter: 'blur(20px)',
                                borderRadius: '100px',
                            }}
                        />
                    ) : (
                        <IoArrowDownCircle
                            color={lib.colors.transparentRed}
                            style={{
                                position: 'absolute',
                                top: 5,
                                right: 5,
                                zIndex: 2,
                                WebkitBackdropFilter: 'blur(20px)',
                                borderRadius: '100px',
                            }}
                        />
                    ))}
            </div>
        </div>
    );
};

export default ({ data }: { data: RotateOModalData }) => {
    const isOpen = client.modal.useOpen();

    const address = web3.hook.usePriorityAccount();

    // const network = web3.hook.useNetworkProvider();
    const chainId = web3.hook.usePriorityChainId();
    const peer = web3.hook.usePriorityPeer();
    const closeModal = client.modal.useCloseModal();
    const [page, setPage] = client.modal.usePhase();

    const [tabFadeTransition] = useTransition(
        page,
        {
            initial: {
                transform: 'translate(0px, 0px)',
            },
            from: (p, i) => ({
                transform: p === i ? 'translate(1000px, 0px)' : 'translate(-1000px, 0px)',
            }),
            expires: 500,
            enter: { transform: 'translate(0px, 0px)' },
            leave: (p, i) => {
                return {
                    transform: p === i ? 'translate(-1000px, 0px)' : 'translate(1000px, 0px)',
                };
            },
            keys: (item) => `tabFadeTransition${item}5`,
            config: config.default,
        },
        [page, isOpen],
    );

    const {
        items,
        setItems,
        error,
        send,
        hash,
        calculating,
        populatedTransaction,
        estimator,
        svg,
        loading,
    } = useHotRotateO(data.tokenId);

    const containerStyle = useSpring({
        to: {
            transform: isOpen ? 'scale(1.0)' : 'scale(0.9)',
        },
        config: config.default,
    });

    const caller = React.useCallback(
        (item: HotRotateOItem | undefined) => {
            if (items && item && item.feature !== 0) {
                if (items.active.findIndex((x) => item.tokenId === x.tokenId) === -1) {
                    // if they are not active --- add
                    setItems({
                        ...items,

                        active: [
                            ...items.active.filter((x) => x.feature !== item.feature),
                            item,
                        ].sort((a, b) => a.feature - b.feature),
                        hidden: [
                            ...items.hidden.filter((x) => x.tokenId !== item.tokenId),
                            ...items.active.filter((x) => x.feature === item.feature),
                        ].sort((a, b) => a.feature - b.feature),
                    });
                } else {
                    setItems({
                        ...items,
                        active: [...items.active.filter((x) => x.feature !== item.feature)].sort(
                            (a, b) => a.feature - b.feature,
                        ),
                        hidden: [item, ...items.hidden].sort((a, b) => a.feature - b.feature),
                    });
                }
            }
        },
        [items, setItems],
    );

    const sortedList = React.useMemo(() => {
        if (items) {
            return items.byItem.reduce(
                (prev, curr, index) => {
                    prev[index].push(undefined);

                    curr.forEach((b) => {
                        if (items.active.findIndex((x) => b.tokenId === x.tokenId) !== -1) {
                            prev[index][0] = b;
                        } else {
                            prev[index].push(b);
                        }
                    });

                    return prev;
                },
                [[], [], [], [], [], [], [], []] as Array<Array<HotRotateOItem | undefined>>,
            );
        }
        return [];
    }, [items]);

    const Page0 = React.useMemo(
        () => (
            <>
                <TokenViewer
                    svgNotFromGraph={svg}
                    tokenId={data.tokenId}
                    style={{ width: '200px', height: '200px' }}
                />
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        borderRadius: lib.layout.borderRadius.large,
                        padding: '.4rem 1rem .8rem',
                        textAlign: 'center',
                        verticalAlign: 'center',
                        marginBottom: '.4rem',
                        backgroundColor: 'transparent',
                    }}
                >
                    {/* <div style={{ height: 30, width: 15, display: 'flex', alignItems: 'center' }}>
                        {loading ? (
                            <Loader style={{ height: 15, width: 15 }} />
                        ) : ( */}
                    <img
                        alt="ethereum logo"
                        src={eth}
                        height={30}
                        style={{
                            objectFit: 'cover',
                        }}
                    />
                    {/* )}
                    </div> */}

                    <span
                        style={{
                            marginLeft: 10,
                            fontSize: '18px',
                            color: lib.colors.transparentPrimaryColor,
                            ...lib.layout.presets.font.main.semibold,
                        }}
                    >
                        generated on ethereum
                    </span>
                </div>
                <div
                    style={{
                        marginTop: 20,
                        width: '100%',
                        display: 'flex',
                        alignItems: 'flex-start',
                        overflow: 'scroll',
                        height: 200,
                    }}
                >
                    {(sortedList ?? [[], [], [], [], [], [], [], []]).map((x, index) => (
                        <RenderItemMobileTiny2 item={x} action={caller} index={index} />
                    ))}
                </div>

                <Button
                    className="mobile-pressable-div"
                    label="save"
                    onClick={() => {
                        setPage(1);
                    }}
                    disabled={calculating || !!estimator.error}
                    buttonStyle={{
                        borderRadius: lib.layout.borderRadius.large,
                        background: lib.colors.primaryColor,
                        marginTop: '20px',
                    }}
                    textStyle={{
                        color: lib.colors.white,
                        fontSize: 30,
                    }}
                />
            </>
        ),
        [setPage, calculating, estimator.error, items?.byItem, svg, loading],
    );
    const Page1 = React.useMemo(
        () =>
            isOpen && peer ? (
                <>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <TokenViewer
                            svgNotFromGraph={svg}
                            style={{
                                width: '200px',
                                height: '200px',
                                padding: 10,
                                margin: 10,
                                background: lib.colors.transparentWhite,
                                borderRadius: lib.layout.borderRadius.medium,
                                boxShadow: lib.layout.boxShadow.basic,
                            }}
                        />
                        <HiArrowCircleUp
                            size={30}
                            style={{ marginRight: 3, color: lib.colors.primaryColor }}
                        />
                        <TokenViewer
                            tokenId={data.tokenId}
                            style={{
                                width: '150px',
                                height: '150px',
                                padding: 10,
                                margin: 10,
                                background: lib.colors.transparentWhite,
                                borderRadius: lib.layout.borderRadius.medium,
                                boxShadow: lib.layout.boxShadow.basic,
                            }}
                        />
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            justifyContent: 'center',
                            marginTop: '20px',
                        }}
                    >
                        <Button
                            className="mobile-pressable-div"
                            // @ts-ignore
                            buttonStyle={{
                                background: lib.colors.primaryColor,
                                color: 'white',
                                borderRadius: lib.layout.borderRadius.medium,
                                boxShadow: lib.layout.boxShadow.basic,
                                width: 'auto',
                            }}
                            hoverStyle={{ filter: 'brightness(1)' }}
                            disabled={!peer}
                            onClick={(event) => {
                                if (!peer || !populatedTransaction) return;

                                if (peer.type === 'metamask' && peer.injected) {
                                    void send(populatedTransaction, () => {
                                        setPage(2);
                                    });
                                } else if ('deeplink_href' in peer) {
                                    event.preventDefault();
                                    event.stopPropagation();

                                    if (populatedTransaction !== undefined && peer) {
                                        void send(populatedTransaction, () => {
                                            setPage(2);
                                            window.open(peer.deeplink_href || '');
                                        });
                                    }
                                } else {
                                    void send(populatedTransaction, () => {
                                        setPage(2);
                                    });
                                }
                            }}
                            // label="open"
                            size="largerish"
                            textStyle={{ color: lib.colors.white, marginLeft: 10 }}
                            leftIcon={<NLStaticImage image={`${peer.peer}_icon`} />}
                            rightIcon={
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'left',
                                        flexDirection: 'column',
                                        // width: '100%',
                                        marginLeft: 10,
                                    }}
                                >
                                    <Text textStyle={{ color: lib.colors.white, fontSize: 20 }}>
                                        tap to finalize on
                                    </Text>
                                    <Text
                                        textStyle={{
                                            color: lib.colors.white,
                                            fontSize: 32,
                                        }}
                                    >
                                        {peer.name}
                                    </Text>
                                </div>
                            }
                        />
                    </div>
                </>
            ) : null,
        [setPage, isOpen, send, populatedTransaction, peer, data.tokenId, svg],
    );

    const Page2 = React.useMemo(() => {
        return isOpen && chainId && address ? (
            <>
                <TransactionVisualConfirmation
                    hash={hash}
                    onDismiss={closeModal}
                    error={error}
                    ConfirmationView={React.memo(() => {
                        return (
                            <div>
                                <TokenViewer
                                    svgNotFromGraph={svg}
                                    style={{
                                        width: '200px',
                                        height: '200px',
                                        padding: 10,
                                        margin: 30,
                                        background: lib.colors.transparentWhite,
                                        borderRadius: lib.layout.borderRadius.medium,
                                        boxShadow: lib.layout.boxShadow.basic,
                                    }}
                                />
                                <Text
                                    size="large"
                                    textStyle={{
                                        color: lib.colors.primaryColor,
                                        fontWeight: lib.layout.fontWeight.semibold,
                                        padding: 10,
                                        width: '100%',
                                        textAlign: 'center',
                                    }}
                                >
                                    {data.tokenId.toPrettyId()} v{data.currentVersion + 1} is born!
                                    🎉
                                </Text>
                            </div>
                        );
                    })}
                />
            </>
        ) : null;
    }, [isOpen, closeModal, chainId, data.tokenId, hash, address, error, data.currentVersion, svg]);

    return (
        <>
            {tabFadeTransition((sty, pager) => {
                return (
                    <animated.div
                        style={{
                            // position: 'relative',
                            position: 'absolute',
                            display: 'flex',
                            justifyContent: 'center',
                            width: '100%',
                            margin: 20,
                        }}
                    >
                        <animated.div
                            style={{
                                width: '93%',
                                padding: '25px',
                                position: 'relative',
                                // pointerEvents: 'none',
                                // ...sty,
                                background: lib.colors.transparentWhite,
                                transition: `.2s all ${lib.layout.animation}`,
                                // overflowX: 'visible',
                                borderRadius: lib.layout.borderRadius.largish,
                                boxShadow: lib.layout.boxShadow.basic,
                                margin: '0rem',
                                justifyContent: 'flex-start',
                                backdropFilter: 'blur(10px)',
                                WebkitBackdropFilter: 'blur(10px)',
                                ...containerStyle,
                                ...sty,
                                // transform: `translate(var(--${pager}-dumb)px, 0px)`,
                            }}
                        >
                            <>{pager === 0 ? Page0 : pager === 1 ? Page1 : Page2}</>{' '}
                            {(pager === 1 || pager === 0) && (
                                <>
                                    <Button
                                        className="mobile-pressable-div"
                                        size="small"
                                        buttonStyle={{
                                            position: 'absolute',
                                            left: 3,
                                            bottom: -50,
                                            borderRadius: lib.layout.borderRadius.mediumish,
                                            background: lib.colors.transparentWhite,
                                            WebkitBackdropFilter: 'blur(30px)',
                                            backdropFilter: 'blur(30px)',
                                            boxShadow: lib.layout.boxShadow.basic,
                                        }}
                                        leftIcon={
                                            <IoChevronBackCircle
                                                size={24}
                                                color={lib.colors.primaryColor}
                                                style={{
                                                    marginRight: 5,
                                                    marginLeft: -5,
                                                }}
                                            />
                                        }
                                        textStyle={{
                                            color: lib.colors.primaryColor,
                                            fontSize: 18,
                                        }}
                                        label="go back"
                                        onClick={() => (pager === 0 ? closeModal() : setPage(0))}
                                    />{' '}
                                </>
                            )}
                        </animated.div>
                    </animated.div>
                );
            })}
        </>
    );
};
