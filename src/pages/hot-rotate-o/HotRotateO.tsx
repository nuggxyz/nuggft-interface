import { animated } from '@react-spring/web';
import React, { FC, useState } from 'react';
import { useNavigate, useMatch } from 'react-router-dom';
import { t } from '@lingui/macro';
import {
    IoArrowDown,
    IoArrowDownCircle,
    IoArrowUp,
    IoArrowUpCircle,
    IoReload,
} from 'react-icons/io5';
import Confetti from 'react-confetti';
import { BigNumber } from '@ethersproject/bignumber/lib/bignumber';

import client from '@src/client';
import TokenViewer from '@src/components/nugg/TokenViewer';
import Button from '@src/components/general/Buttons/Button/Button';
import lib, { parseItmeIdToNum } from '@src/lib';
import { useAsyncSetState, useMemoizedAsyncState } from '@src/hooks/useAsyncState';
import {
    useNuggftV1,
    useDotnuggV1,
    usePrioritySendTransaction,
    useTransactionManager2,
} from '@src/contracts/useContract';
import Label from '@src/components/general/Label/Label';
import web3 from '@src/web3';
import useAnimateOverlay from '@src/hooks/useAnimateOverlay';
import Text from '@src/components/general/Texts/Text/Text';
import { buildTokenIdFactory } from '@src/prototypes';
import Loader from '@src/components/general/Loader/Loader';
import emitter from '@src/emitter';
import globalStyles from '@src/lib/globalStyles';
import { useDotnuggInjectToCache } from '@src/client/hooks/useDotnugg';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import useDimensions from '@src/client/hooks/useDimensions';
import TransactionVisualConfirmation from '@src/components/nugg/TransactionVisualConfirmation';
import { GodListRenderItemProps } from '@src/components/general/List/GodList';
import SimpleList, { SimpleListRenderItemProps } from '@src/components/general/List/SimpleList';

import styles from './HotRotateO.styles';

export interface HotRotateOItem extends ItemIdFactory<TokenIdFactoryBase> {
    activeIndex: number;
    tokenId: ItemId;
    position: number;
    feature: number;
    hexId: number;
    desiredIndex?: number;
    duplicates: number;
}

export type HotRotateOItemList = {
    active: HotRotateOItem[];
    hidden: HotRotateOItem[];
    duplicates: HotRotateOItem[];
    byItem: FixedLengthArray<HotRotateOItem[], 8>;
};

const HotRotateOController = () => {
    const openEditScreen = client.editscreen.useOpenEditScreen();
    const closeEditScreen = client.editscreen.useCloseEditScreen();

    const tokenId = useMatch(`/edit/:id`);

    const navigate = useNavigate();

    React.useEffect(() => {
        if (tokenId && tokenId.params.id && tokenId.params.id.isNuggId())
            openEditScreen(tokenId.params.id);
        return () => {
            closeEditScreen();
        };
    }, [tokenId, openEditScreen, closeEditScreen, navigate]);

    return <HotRotateO />;
};

const RenderItemMobileTiny2: FC<
    GodListRenderItemProps<
        (HotRotateOItem | undefined)[],
        undefined,
        HotRotateOItemList['byItem'][number][number]
    >
> = ({ item, action }) => {
    const id = React.useId();
    return (
        <div>
            {(item ?? []).map((x, index) => (
                <RenderItemMobileTiny
                    item={x}
                    action={action}
                    index={index}
                    key={`${id}-${index}`}
                />
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
                        // forceCache
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

const RenderItem: FC<
    SimpleListRenderItemProps<
        HotRotateOItem,
        {
            type: 'storage' | 'displayed';
        },
        HotRotateOItem
    >
> = ({ item, action, extraData }) => {
    return (
        <div style={styles.renderItemContainer}>
            <TokenViewer
                forceCache
                tokenId={item.tokenId}
                style={styles.renderToken}
                showLabel
                disableOnClick
            />
            {item.duplicates > 1 && (
                <Label containerStyles={styles.duplicateItem} text={String(item.duplicates)} />
            )}
            {item.feature !== 0 && (
                <Button
                    size="small"
                    onClick={() => action && action(item)}
                    buttonStyle={styles.renderItemButton}
                    textStyle={{
                        paddingRight: '.2rem',
                    }}
                    label={extraData.type === 'storage' ? t`Show` : t`Hide`}
                    rightIcon={
                        extraData.type === 'storage' ? (
                            <IoArrowUp color={lib.colors.nuggBlueText} />
                        ) : (
                            <IoArrowDown color={lib.colors.nuggRedText} />
                        )
                    }
                />
            )}
        </div>
    );
};

export const useHotRotateO = (tokenId?: NuggId, overrideOwner = true, forceMobileList = false) => {
    const provider = web3.hook.useNetworkProvider();
    const dotnugg = useDotnuggV1(provider);
    const address = web3.hook.usePriorityAccount();
    const epoch = client.epoch.active.useId();

    const nuggft = useNuggftV1(provider);

    const [needsToClaim, setNeedsToClaim] = React.useState<boolean>();
    const [cannotProveOwnership, setCannotProveOwnership] = React.useState<boolean>();
    const [saving, setSaving] = useState(false);
    const [savedToChain, setSavedToChain] = useState(false);

    const [items, setItems, og] = useAsyncSetState(() => {
        if (tokenId && provider && epoch) {
            const fmtTokenId = BigNumber.from(tokenId.toRawId());
            console.log('hi there - floop just got called for tokenId ', tokenId);
            const floopCheck = async () => {
                return nuggft.floop(fmtTokenId).then((x) => {
                    const res = x.reduce(
                        (prev: Omit<HotRotateOItemList, 'byItem'>, curr, activeIndex) => {
                            const parsed = parseItmeIdToNum(curr);
                            if (curr === 0) return prev;
                            if (
                                activeIndex < 8 &&
                                !prev.active.find((z) => z.feature === parsed.feature)
                            ) {
                                prev.active.push(
                                    buildTokenIdFactory({
                                        duplicates: 1,
                                        activeIndex,
                                        hexId: curr,
                                        tokenId: curr.toItemId(),
                                        ...parsed,
                                    }),
                                );
                            } else if (
                                !prev.active.find(
                                    (z) =>
                                        z.feature === parsed.feature &&
                                        z.position === parsed.position,
                                ) &&
                                !prev.hidden.find(
                                    (z) =>
                                        z.feature === parsed.feature &&
                                        z.position === parsed.position,
                                )
                            ) {
                                prev.hidden.push(
                                    buildTokenIdFactory({
                                        activeIndex,
                                        hexId: curr,
                                        duplicates: 1,
                                        tokenId: curr.toItemId(),
                                        ...parsed,
                                    }),
                                );
                            } else {
                                prev.active.forEach((z) => {
                                    if (
                                        z.feature === parsed.feature &&
                                        z.position === parsed.position
                                    )
                                        z.duplicates++;
                                });
                                prev.hidden.forEach((z) => {
                                    if (
                                        z.feature === parsed.feature &&
                                        z.position === parsed.position
                                    )
                                        z.duplicates++;
                                });
                                prev.duplicates.push(
                                    buildTokenIdFactory({
                                        duplicates: 0,
                                        activeIndex,
                                        hexId: curr,
                                        tokenId: curr.toItemId(),
                                        ...parsed,
                                    }),
                                );
                            }
                            return prev;
                        },
                        { active: [], hidden: [], duplicates: [] },
                    );
                    return {
                        ...res,
                        byItem: [...res.active, ...res.hidden].reduce(
                            (prev, curr) => {
                                prev[curr.feature].push(curr);
                                return prev;
                            },
                            [[], [], [], [], [], [], [], []] as HotRotateOItemList['byItem'],
                        ),
                    };
                });
            };

            if (overrideOwner) {
                return floopCheck();
            }

            if (!address) {
                setCannotProveOwnership(true);
                return undefined;
            }

            return nuggft.ownerOf(fmtTokenId).then((y) => {
                setNeedsToClaim(false);
                setCannotProveOwnership(false);
                if (y.toLowerCase() === address.toLowerCase()) {
                    return floopCheck();
                }
                return nuggft.agency(fmtTokenId).then((agency) => {
                    return nuggft.offers(fmtTokenId, address).then((offer) => {
                        if (
                            agency._hex === offer._hex ||
                            (offer.isZero() &&
                                agency.mask(160).eq(address) &&
                                agency.shr(230).mask(24).lt(epoch))
                        ) {
                            setNeedsToClaim(true);

                            return floopCheck();
                        }
                        setCannotProveOwnership(true);

                        return undefined;
                    });
                });
            });
        }
        return undefined;
    }, [tokenId, nuggft, provider, address, epoch, overrideOwner]);

    const { screen } = useDimensions();

    const [svg, , , loading] = useAsyncSetState(() => {
        const arr: BigNumberish[] = new Array<BigNumberish>(8);

        if (provider) {
            if (items && items.active) {
                for (let i = 0; i < 8; i++) {
                    arr[i] = BigNumber.from(
                        items.active.find((x) => x.feature === i)?.hexId ?? 0,
                    ).mod(1000);
                }
                return dotnugg['exec(uint8[8],bool)'](
                    arr as Parameters<typeof dotnugg['exec(uint8[8],bool)']>[0],
                    true,
                ) as Promise<Base64EncodedSvg>;
            }
        }

        return undefined;
    }, [items, dotnugg, provider]);

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

    const MobileList = React.useMemo(() => {
        return screen === 'phone' || forceMobileList ? (
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
                {(!sortedList || sortedList.length === 0) && (
                    <div
                        style={{
                            width: '100%',
                            height: 200,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <Loader style={{ color: lib.colors.primaryColor }} />{' '}
                    </div>
                )}
                {(sortedList ?? [[], [], [], [], [], [], [], []]).map((x, index) => (
                    <RenderItemMobileTiny2
                        item={x}
                        action={caller}
                        index={index}
                        key={`sorted-list-${index}`}
                    />
                ))}
            </div>
        ) : null;
    }, [sortedList, caller, screen, forceMobileList]);

    const DesktopList = React.useMemo(() => {
        return screen !== 'phone' && !forceMobileList ? (
            <>
                <div
                    style={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                    }}
                >
                    <div style={styles[`${'horizontal'}ListContainer`]}>
                        <SimpleList
                            data={items?.active || []}
                            label={t`Displayed`}
                            labelStyle={globalStyles.textBlack}
                            action={caller}
                            extraData={{
                                type: 'displayed' as const,
                            }}
                            RenderItem={RenderItem}
                            horizontal
                            style={styles.list}
                        />
                    </div>
                    <div style={styles[`${'horizontal'}ListContainer`]}>
                        <SimpleList
                            data={items?.hidden || []}
                            label={t`In storage`}
                            listEmptyText={t`All items are displayed`}
                            listEmptyStyle={globalStyles.centered}
                            labelStyle={globalStyles.textBlack}
                            extraData={{ type: 'storage' as const }}
                            RenderItem={RenderItem}
                            horizontal
                            action={caller}
                            style={styles.list}
                        />
                    </div>
                </div>
            </>
        ) : null;
    }, [caller, items?.active, screen, items?.hidden]);

    return [
        screen,
        items,
        setItems,
        needsToClaim,
        savedToChain,
        cannotProveOwnership,
        setSavedToChain,
        saving,
        setSaving,
        loading,
        svg,
        caller,
        sortedList,
        MobileList,
        DesktopList,
        og,
    ] as const;
};

export const useHotRotateOTransaction = (tokenId?: NuggId) => {
    const inject = useDotnuggInjectToCache();
    const provider = web3.hook.usePriorityProvider();
    const address = web3.hook.usePriorityAccount();

    const nuggft = useNuggftV1(provider);

    const [
        screen,
        items,
        setItems,
        needsToClaim,
        savedToChain,
        cannotProveOwnership,
        setSavedToChain,
        saving,
        setSaving,
        loading,
        svg,
        caller,
        sortedList,
        MobileList,
        DesktopList,
        og,
    ] = useHotRotateO(tokenId, false);

    const algo: Parameters<typeof nuggft.rotate> | undefined = React.useMemo(() => {
        if (items && tokenId) {
            const active = items.active.map((x, i) => ({ ...x, desiredIndex: i }));
            const hidden = items.hidden.map((x, i) => ({ ...x, desiredIndex: i + 8 }));
            const duplicates = items.duplicates.map((x, i) => ({ ...x, desiredIndex: i + 8 }));

            const current = [...active, ...hidden, ...duplicates].reduce(
                (prev: (HotRotateOItem | undefined)[], curr) => {
                    prev[curr.activeIndex] = curr;
                    return prev;
                },
                new Array(16).fill(undefined) as undefined[],
            );

            const moves: { from: number; to: number }[] = [];

            let check = 0;

            while (current.findIndex((x, i) => x !== undefined && x.desiredIndex !== i) !== -1) {
                if (check++ > 100) break;
                for (let i = 0; i < 16; i++) {
                    let desired = current[i]?.desiredIndex;
                    if (desired && desired !== i) {
                        while (current[desired] !== undefined) desired++;
                        current[desired] = current[i];
                        current[i] = undefined;
                        moves.push({ from: i, to: desired });
                    }
                }
            }
            return [
                BigNumber.from(tokenId.toRawId()),
                moves.map((x) => x.from),
                moves.map((x) => x.to),
            ];
        }
        return undefined;
    }, [items, tokenId]);

    const populatedTransaction = React.useMemo(() => {
        if (!tokenId || !address || !algo) return undefined;
        const main = nuggft.populateTransaction['rotate(uint24,uint8[],uint8[])'](...algo);

        if (needsToClaim) {
            const check = async () => {
                return nuggft.populateTransaction.multicall(
                    await Promise.all([
                        nuggft.populateTransaction
                            .claim(
                                [tokenId.toRawId()],
                                [address],
                                [BigNumber.from(0)],
                                [BigNumber.from(0)],
                            )
                            .then((x) => x.data || '0x0'),
                        main.then((x) => x.data || '0x0'),
                    ]),
                );
            };

            return check();
        }

        return main;
    }, [nuggft, address, algo, needsToClaim, tokenId]);

    const [send, estimator, hash, error, ,] = usePrioritySendTransaction();
    useTransactionManager2(provider, hash, undefined);

    const network = web3.hook.useNetworkProvider();

    const estimation = useMemoizedAsyncState(
        () => {
            if (populatedTransaction && network) {
                return Promise.all([
                    estimator.estimate(populatedTransaction),
                    network?.getGasPrice(),
                ]).then((_data) => ({
                    gasLimit: _data[0] || BigNumber.from(0),
                    // gasPrice: new EthInt(_data[1] || 0),
                    // mul: new EthInt((_data[0] || BigNumber.from(0)).mul(_data[1] || 0)),
                    // amount: populatedTransaction.amount,
                }));
            }

            return undefined;
        },
        [populatedTransaction, network, items?.active] as const,
        (prev, curr) => {
            return (prev[2] && prev[2].every((v, i) => curr[2] && v === curr[2][i])) ?? false;
        },
    );

    const calculating = React.useMemo(() => {
        if (estimator.error) return false;
        if (populatedTransaction && estimation) {
            return false;
        }
        return true;
    }, [populatedTransaction, estimation]);

    emitter.useOn(
        emitter.events.Rotate,
        (event) => {
            if (saving) setSaving(false);
            if (event.event.args.tokenId === Number(tokenId?.toRawId())) {
                setSavedToChain(true);
                if (tokenId && svg) inject(tokenId, svg);
            }
        },
        [tokenId, svg, saving, inject],
    );

    return [
        algo,
        estimation,
        send,
        hash,
        calculating,
        populatedTransaction,
        estimator,
        error,
        screen,
        items,
        setItems,
        needsToClaim,
        savedToChain,
        cannotProveOwnership,
        nuggft,
        setSavedToChain,
        saving,
        setSaving,
        loading,
        svg,
        caller,
        sortedList,
        MobileList,
        DesktopList,
        og,
    ] as const;
};

export const HotRotateO = ({ tokenId: overridedTokenId }: { tokenId?: NuggId }) => {
    const openEditScreen = client.editscreen.useEditScreenOpen();
    const tokenId = client.editscreen.useEditScreenTokenIdWithOverride(overridedTokenId);

    const style = useAnimateOverlay(openEditScreen || !!overridedTokenId, {
        zIndex: 998,
    });

    const [
        algo,
        ,
        send,
        hash,
        ,
        populatedTransaction,
        estimator,
        ,
        screen,
        items,
        setItems,
        ,
        savedToChain,
        cannotProveOwnership,
        ,
        setSavedToChain,
        saving,
        setSaving,
        loading,
        svg,
        ,
        ,
        ,
        DesktopList,
        og,
    ] = useHotRotateOTransaction(tokenId);

    const navigate = useNavigate();

    const width = React.useMemo(() => {
        if (savedToChain) {
            return '0%';
        }
        switch (screen) {
            case 'desktop':
                return '45%';
            case 'tablet':
                return '55%';
            case 'phone':
                return '100%';
            default:
                return '45%';
        }
    }, [screen, savedToChain]);

    if (cannotProveOwnership) {
        return (
            <animated.div style={{ ...styles.desktopContainer, ...style }}>
                <Label text="Canot prove ownership" />
            </animated.div>
        );
    }

    return (
        <animated.div
            style={{
                ...styles[`${screen}Container`],
                ...style,
                opacity: items ? 1 : 0,
            }}
        >
            <Confetti
                numberOfPieces={50}
                run={savedToChain}
                style={{
                    transition: `opacity .5s ${lib.layout.animation}`,
                    opacity: savedToChain ? 1 : 0,
                }}
            />
            {tokenId && items && (
                <>
                    <div
                        style={{
                            ...styles[`${screen}ControlContainer`],
                            transition: `opacity .5s ${savedToChain ? '0s' : '.5s'} ${
                                lib.layout.animation
                            }, width 1s ${savedToChain ? '.5s' : '0s'} ${
                                lib.layout.animation
                            }, height 1s ${savedToChain ? '.5s' : '0s'} ${lib.layout.animation}`,
                            opacity: savedToChain ? 0 : 1,
                            pointerEvents: savedToChain ? 'none' : 'auto',
                            width,
                            height: 'auto',
                        }}
                    >
                        {saving ? (
                            <TransactionVisualConfirmation hash={hash} />
                        ) : (
                            <>
                                <Text
                                    size="larger"
                                    textStyle={styles.title}
                                >{t`Edit Nugg ${tokenId.toRawId()}`}</Text>
                                <Button
                                    label={t`Reset`}
                                    buttonStyle={{
                                        borderRadius: lib.layout.borderRadius.large,
                                        padding: '.3rem .7rem .3rem 1rem',
                                        position: 'absolute',
                                        top: '1rem',
                                        right: '1rem',
                                    }}
                                    textStyle={{ paddingRight: '.3rem' }}
                                    onClick={() => setItems(og)}
                                    disabled={JSON.stringify(og) === JSON.stringify(items)}
                                    rightIcon={<IoReload />}
                                />
                                {DesktopList}
                            </>
                        )}
                        <div style={styles.buttonsContainer}>
                            <Button
                                buttonStyle={styles.button}
                                textStyle={{ color: lib.colors.nuggRedText }}
                                label={t`Cancel`}
                                onClick={() => {
                                    navigate(-1);
                                    setSaving(false);
                                }}
                            />

                            {!saving && (
                                <FeedbackButton
                                    feedbackText={t`Check Wallet`}
                                    buttonStyle={styles.button}
                                    textStyle={{ color: lib.colors.nuggBlueText }}
                                    disabled={
                                        !(algo && algo[1] && algo[1].length > 0) ||
                                        !!estimator.error
                                    }
                                    label={t`Save`}
                                    onClick={() => {
                                        if (populatedTransaction) {
                                            setSaving(true);
                                            void send(populatedTransaction);
                                        }
                                    }}
                                />
                            )}
                        </div>
                    </div>
                    <div
                        style={
                            screen === 'phone'
                                ? {
                                      height: '40%',
                                      width: '100%',
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      flexDirection: 'column',
                                  }
                                : {}
                        }
                    >
                        <div style={styles[`${screen}TokenContainer`]}>
                            <div style={{ ...styles.loadingIndicator, opacity: loading ? 1 : 0 }}>
                                <Text
                                    textStyle={{
                                        color: lib.colors.textColor,
                                        paddingRight: '.3rem',
                                    }}
                                >{t`Loading`}</Text>
                                <Loader color={lib.colors.textColor} />
                            </div>
                            <TokenViewer
                                tokenId={tokenId}
                                svgNotFromGraph={svg}
                                showcase
                                style={styles[`${screen}Token`]}
                            />
                        </div>
                        <div
                            style={{
                                width: '100%',
                                opacity: savedToChain ? 1 : 0,
                                pointerEvents: savedToChain ? 'auto' : 'none',
                                position: savedToChain ? 'relative' : 'absolute',
                                transition: `opacity .5s ${lib.layout.animation}, display .5s ${lib.layout.animation}`,
                            }}
                        >
                            <Text
                                size="larger"
                                textStyle={styles.title}
                            >{t`Nugg ${tokenId.toRawId()} saved!`}</Text>
                            <div style={styles.buttonsContainer}>
                                <Button
                                    buttonStyle={styles.button}
                                    textStyle={{ color: lib.colors.nuggRedText }}
                                    label={t`Exit`}
                                    onClick={() => {
                                        navigate(-1);
                                    }}
                                />

                                <Button
                                    buttonStyle={styles.button}
                                    textStyle={{ color: lib.colors.nuggBlueText }}
                                    label={t`Edit again`}
                                    onClick={() => {
                                        setSavedToChain(false);
                                        setSaving(false);
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </animated.div>
    );
};

export default HotRotateOController;
