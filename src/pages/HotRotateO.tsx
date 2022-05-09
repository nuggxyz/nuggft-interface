import { animated } from '@react-spring/web';
import React, { FC, useEffect, useState } from 'react';
import { ethers, BigNumber, BigNumberish } from 'ethers';
import { useNavigate, useMatch, NavigateFunction } from 'react-router-dom';
import { t } from '@lingui/macro';
import { IoArrowBack, IoArrowDown, IoArrowForward, IoArrowUp, IoReload } from 'react-icons/io5';
import Confetti from 'react-confetti';

import client from '@src/client';
import TokenViewer from '@src/components/nugg/TokenViewer';
import Button from '@src/components/general/Buttons/Button/Button';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import lib, { parseItmeIdToNum } from '@src/lib';
import { useAsyncSetState } from '@src/hooks/useAsyncState';
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
import { NuggftV1 } from '@src/typechain';
import { useDotnuggInjectToCache } from '@src/client/hooks/useDotnugg';
import FeedbackButton from '@src/components/general/Buttons/FeedbackButton/FeedbackButton';
import useDimensions from '@src/client/hooks/useDimensions';
import TransactionVisualConfirmation from '@src/components/nugg/TransactionVisualConfirmation';

import styles from './HotRotateO.styles';

interface Item extends ItemIdFactory<TokenIdFactoryBase> {
    activeIndex: number;
    tokenId: ItemId;
    position: number;
    feature: number;
    hexId: number;
    desiredIndex?: number;
    duplicates: number;
}

type ItemList = { active: Item[]; hidden: Item[]; duplicates: Item[] };

export const HotRotateOController = () => {
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

const RenderItemMobile: FC<
    ListRenderItemProps<
        Item,
        { items: ItemList; type: 'storage' | 'displayed'; screen: 'desktop' | 'tablet' | 'phone' },
        Item
    >
> = ({ item, action, extraData }) => {
    return (
        <Button
            onClick={() => action && action(item)}
            disabled={item.feature === 0}
            bypassDisableStyle
            buttonStyle={styles.renderItemButtonMobile}
        >
            <div style={styles.renderItemContainer}>
                <TokenViewer
                    forceCache
                    tokenId={item.tokenId}
                    style={styles.renderTokenMobile}
                    showLabel
                    disableOnClick
                />
                {item.duplicates > 1 && (
                    <Label containerStyles={styles.duplicateItem} text={String(item.duplicates)} />
                )}
                {item.feature !== 0 && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'centter',
                            marginTop: '.5rem',
                        }}
                    >
                        {extraData.type === 'displayed' && (
                            <IoArrowBack color={lib.colors.nuggRedText} />
                        )}
                        <Text
                            size="small"
                            textStyle={{
                                color:
                                    extraData.type === 'displayed'
                                        ? lib.colors.nuggRedText
                                        : lib.colors.nuggBlueText,
                                padding: '0rem .2rem',
                            }}
                        >
                            {extraData.type === 'storage'
                                ? extraData.items.active.find(
                                      (list) => list.feature === item.feature,
                                  )
                                    ? 'Replace'
                                    : 'Show'
                                : t`Hide`}
                        </Text>
                        {extraData.type === 'storage' && (
                            <IoArrowForward color={lib.colors.nuggBlueText} />
                        )}
                    </div>
                )}
            </div>
        </Button>
    );
};

const RenderItem: FC<
    ListRenderItemProps<
        Item,
        { items: ItemList; type: 'storage' | 'displayed'; screen: 'desktop' | 'tablet' | 'phone' },
        Item
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
                    label={
                        extraData.type === 'storage'
                            ? extraData.items.active.find((list) => list.feature === item.feature)
                                ? 'Replace'
                                : 'Show'
                            : t`Hide`
                    }
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

const HotRotateO = () => {
    const openEditScreen = client.editscreen.useEditScreenOpen();
    const tokenId = client.editscreen.useEditScreenTokenId();

    const [saving, setSaving] = useState(false);
    const [savedToChain, setSavedToChain] = useState(false);

    const style = useAnimateOverlay(openEditScreen, {
        zIndex: 998,
    });

    const provider = web3.hook.usePriorityProvider();
    const address = web3.hook.usePriorityAccount();

    const nuggft = useNuggftV1(provider);

    const [needsToClaim, setNeedsToClaim] = React.useState<boolean>();
    const [cannotProveOwnership, setCannotProveOwnership] = React.useState<boolean>();

    emitter.on({
        type: emitter.events.Rotate,
        callback: ({ event }) => {
            if (saving && event.args.tokenId === Number(tokenId?.toRawId())) {
                setSaving(false);
                setSavedToChain(true);
            }
        },
    });

    const [items, setItems] = useAsyncSetState<ItemList>(() => {
        if (tokenId && provider) {
            if (!address) {
                setCannotProveOwnership(true);
                return undefined;
            }
            const fmtTokenId = ethers.BigNumber.from(tokenId.toRawId());

            const floopCheck = async () => {
                return nuggft.floop(fmtTokenId).then((x) => {
                    const res = x.reduce(
                        (prev: ItemList, curr, activeIndex) => {
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
                    return res;
                });
            };
            return nuggft.ownerOf(fmtTokenId).then((y) => {
                setNeedsToClaim(false);
                setCannotProveOwnership(false);
                if (y.toLowerCase() === address.toLowerCase()) {
                    return floopCheck();
                }
                return nuggft.agency(fmtTokenId).then((agency) => {
                    return nuggft.offers(fmtTokenId, address).then((offer) => {
                        if (agency._hex === offer._hex) {
                            setNeedsToClaim(true);
                        } else {
                            setCannotProveOwnership(true);
                        }
                        return undefined;
                    });
                });
            });
        }
        return undefined;
    }, [tokenId, nuggft, provider, address]);

    const navigate = useNavigate();

    const { screen } = useDimensions();

    if (needsToClaim) {
        return (
            <animated.div style={{ ...styles.desktopContainer, ...style }}>
                <Label text="Needs to claim" />
            </animated.div>
        );
    }

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
                    <RotateOSelector
                        {...{
                            tokenId,
                            items,
                            navigate,
                            nuggft,
                            setItems,
                            setSaving,
                            saving,
                            savedToChain,
                            screen,
                        }}
                    />
                    <RotateOViewer
                        {...{
                            items,
                            tokenId,
                            savedToChain,
                            screen,
                            setItems,
                            navigate,
                            setSavedToChain,
                            setSaving,
                        }}
                    />
                </>
            )}
        </animated.div>
    );
};

const RotateOViewer = ({
    tokenId,
    items,
    setItems,
    savedToChain,
    navigate,
    setSaving,
    setSavedToChain,
    screen,
}: {
    tokenId: TokenId;
    items: ItemList;
    savedToChain: boolean;
    setItems: React.Dispatch<React.SetStateAction<ItemList | null | undefined>>;
    setSaving: React.Dispatch<React.SetStateAction<boolean>>;
    setSavedToChain: React.Dispatch<React.SetStateAction<boolean>>;
    navigate: NavigateFunction;
    screen: 'desktop' | 'tablet' | 'phone';
}) => {
    const provider = web3.hook.usePriorityProvider();
    const dotnugg = useDotnuggV1(provider);

    const inject = useDotnuggInjectToCache();

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

    useEffect(() => {
        if (savedToChain && svg) {
            inject(tokenId, svg);
            setItems({
                active: items.active.map((item, index) => ({ ...item, activeIndex: index })),
                hidden: items.hidden.map((item, index) => ({ ...item, activeIndex: index + 8 })),
                duplicates: items.duplicates,
            });
        }
    }, [savedToChain, svg, inject, tokenId]);

    return (
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
                        textStyle={{ color: lib.colors.textColor, paddingRight: '.3rem' }}
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
    );
};

const RotateOSelector = ({
    tokenId,
    items,
    navigate,
    nuggft,
    setItems,
    setSaving,
    saving,
    savedToChain,
    screen,
}: {
    tokenId: TokenId;
    items: ItemList;
    navigate: NavigateFunction;
    nuggft: NuggftV1;
    setItems: React.Dispatch<React.SetStateAction<ItemList | null | undefined>>;
    setSaving: React.Dispatch<React.SetStateAction<boolean>>;
    saving: boolean;
    savedToChain: boolean;
    screen: 'desktop' | 'tablet' | 'phone';
}) => {
    const { send, hash } = usePrioritySendTransaction(true);
    const provider = web3.hook.useNetworkProvider();
    const transaction = useTransactionManager2(provider, hash);

    const algo: Parameters<typeof nuggft.rotate> | undefined = React.useMemo(() => {
        if (items && tokenId) {
            const active = items.active.map((x, i) => ({ ...x, desiredIndex: i }));
            const hidden = items.hidden.map((x, i) => ({ ...x, desiredIndex: i + 8 }));
            const duplicates = items.duplicates.map((x, i) => ({ ...x, desiredIndex: i + 8 }));

            const current = [...active, ...hidden, ...duplicates].reduce(
                (prev: (Item | undefined)[], curr) => {
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

    const [originalItems, setOriginalItems] = useState(items);
    useEffect(() => {
        setOriginalItems(items);
    }, [tokenId, savedToChain]);

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

    const height = React.useMemo(() => {
        if (screen === 'phone') {
            return savedToChain ? '0%' : '60%';
        }
        return 'auto';
    }, [screen, savedToChain]);

    return (
        <div
            style={{
                ...styles[`${screen}ControlContainer`],
                transition: `opacity .5s ${savedToChain ? '0s' : '.5s'} ${
                    lib.layout.animation
                }, width 1s ${savedToChain ? '.5s' : '0s'} ${lib.layout.animation}, height 1s ${
                    savedToChain ? '.5s' : '0s'
                } ${lib.layout.animation}`,
                opacity: savedToChain ? 0 : 1,
                pointerEvents: savedToChain ? 'none' : 'auto',
                width,
                height,
            }}
        >
            {saving ? (
                <TransactionVisualConfirmation {...{ transaction, hash }} />
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
                        onClick={() => setItems(originalItems)}
                        disabled={JSON.stringify(originalItems) === JSON.stringify(items)}
                        rightIcon={<IoReload />}
                    />
                    <div
                        style={{
                            width: '100%',
                            display: 'flex',
                            flexDirection: screen === 'phone' ? 'row-reverse' : 'column',
                            justifyContent: 'space-between',
                            ...(screen === 'phone' ? { height: '70%' } : {}),
                            position: 'relative',
                        }}
                    >
                        <div
                            style={
                                styles[
                                    `${screen === 'phone' ? 'vertical' : 'horizontal'}ListContainer`
                                ]
                            }
                        >
                            <List
                                data={items.active}
                                label={t`Displayed`}
                                labelStyle={globalStyles.textBlack}
                                action={(item) => {
                                    if (items)
                                        setItems({
                                            active: [
                                                ...items.active.filter(
                                                    (x) => x.feature !== item.feature,
                                                ),
                                            ].sort((a, b) => a.feature - b.feature),
                                            hidden: [item, ...items.hidden].sort(
                                                (a, b) => a.feature - b.feature,
                                            ),
                                            duplicates: items.duplicates,
                                        });
                                }}
                                extraData={{ items, type: 'displayed' as const, screen }}
                                RenderItem={screen === 'phone' ? RenderItemMobile : RenderItem}
                                horizontal={screen !== 'phone'}
                                style={styles.list}
                            />
                        </div>
                        <div
                            style={
                                styles[
                                    `${screen === 'phone' ? 'vertical' : 'horizontal'}ListContainer`
                                ]
                            }
                        >
                            <List
                                data={items.hidden}
                                label={t`In storage`}
                                listEmptyText={t`All items are displayed`}
                                listEmptyStyle={globalStyles.centered}
                                labelStyle={globalStyles.textBlack}
                                extraData={{ items, type: 'storage' as const, screen }}
                                RenderItem={screen === 'phone' ? RenderItemMobile : RenderItem}
                                horizontal={screen !== 'phone'}
                                action={(item) => {
                                    if (items)
                                        setItems({
                                            active: [
                                                ...items.active.filter(
                                                    (x) => x.feature !== item.feature,
                                                ),
                                                item,
                                            ].sort((a, b) => a.feature - b.feature),
                                            hidden: [
                                                ...items.hidden.filter(
                                                    (x) => x.tokenId !== item.tokenId,
                                                ),
                                                ...items.active.filter(
                                                    (x) => x.feature === item.feature,
                                                ),
                                            ].sort((a, b) => a.feature - b.feature),
                                            duplicates: items.duplicates,
                                        });
                                }}
                                style={styles.list}
                            />
                        </div>
                    </div>
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
                        disabled={!(algo && algo[1] && algo[1].length > 0)}
                        label={t`Save`}
                        onClick={() => {
                            if (algo) {
                                setSaving(true);
                                void send(nuggft.populateTransaction.rotate(...algo));
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default HotRotateO;
