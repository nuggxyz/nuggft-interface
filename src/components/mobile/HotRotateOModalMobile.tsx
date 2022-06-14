/* eslint-disable react/jsx-props-no-spreading */
import React from 'react';
import { animated, config, useSpring, useTransition } from '@react-spring/web';
import { IoChevronBackCircle } from 'react-icons/io5';
import { HiArrowCircleUp } from 'react-icons/hi';
import { t } from '@lingui/macro';

import lib from '@src/lib';
import Button from '@src/components/general/Buttons/Button/Button';
import Text from '@src/components/general/Texts/Text/Text';
import TokenViewer from '@src/components/nugg/TokenViewer';
import web3 from '@src/web3';
import client from '@src/client';
import NLStaticImage from '@src/components/general/NLStaticImage';
import TransactionVisualConfirmation from '@src/components/nugg/TransactionVisualConfirmation';
import { RotateOModalData } from '@src/interfaces/modals';
import eth from '@src/assets/images/app_logos/eth.png';
import { useHotRotateOTransaction } from '@src/pages/hot-rotate-o/HotRotateO';

export default ({ data }: { data: RotateOModalData }) => {
    const isOpen = client.modal.useOpen();

    const address = web3.hook.usePriorityAccount();

    const chainId = web3.hook.usePriorityChainId();
    const peer = web3.hook.usePriorityPeer();
    const closeModal = client.modal.useCloseModal();
    const [page, setPage] = client.modal.usePhase();

    const [tabFadeTransition] = useTransition(
        page,
        {
            from: () => ({
                opacity: 0,
            }),
            expires: 500,
            enter: { opacity: 1 },
            leave: () => {
                return {
                    opacity: 0,
                };
            },
            keys: (item) => `tabFadeTransition${item}5`,
            config: config.stiff,
        },
        [page, isOpen],
    );

    const [
        ,
        ,
        send,
        hash,
        calculating,
        populatedTransaction,
        estimator,
        error,
        ,
        items,
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        loading,
        svg,
        ,
        ,
        MobileList,
    ] = useHotRotateOTransaction(data.tokenId);

    const containerStyle = useSpring({
        to: {
            transform: isOpen ? 'scale(1.0)' : 'scale(0.9)',
        },
        config: config.default,
    });

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
                    <img
                        alt="ethereum logo"
                        src={eth}
                        height={30}
                        style={{
                            objectFit: 'cover',
                        }}
                    />

                    <span
                        style={{
                            marginLeft: 10,
                            fontSize: '18px',
                            color: lib.colors.transparentPrimaryColor,
                            ...lib.layout.presets.font.main.semibold,
                        }}
                    >
                        {t`generated on ethereum`}
                    </span>
                </div>

                {MobileList}

                <Button
                    className="mobile-pressable-div"
                    label={t`save`}
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
        [setPage, calculating, estimator.error, items?.byItem, svg, loading, data.tokenId],
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
                            disableOnClick
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
                            disableOnClick
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

                                if (peer.injected) {
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
                                        {t`tap to finalize on`}
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

    const Viewer = React.useMemo(() => {
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
                    {data.tokenId.toPrettyId()} v{data.currentVersion + 1}
                    {t` is born! 🎉`}
                </Text>
            </div>
        );
    }, [svg]);

    const Page2 = React.useMemo(() => {
        return isOpen && chainId && address ? (
            <>
                <TransactionVisualConfirmation
                    hash={hash}
                    onDismiss={closeModal}
                    error={error}
                    ConfirmationView={() => Viewer}
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
                                        label={t`go back`}
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
