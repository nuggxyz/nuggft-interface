import { animated } from '@react-spring/web';
import React, { FC } from 'react';
import { ethers, BigNumber, BigNumberish } from 'ethers';
import { useNavigate, useMatch } from 'react-router-dom';
import { t } from '@lingui/macro';
import { IoArrowDown, IoArrowUp } from 'react-icons/io5';

import client from '@src/client';
import TokenViewer from '@src/components/nugg/TokenViewer';
import Button from '@src/components/general/Buttons/Button/Button';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import lib, { parseItmeIdToNum } from '@src/lib';
import { useAsyncSetState } from '@src/hooks/useAsyncState';
import { useNuggftV1, useDotnuggV1, usePrioritySendTransaction } from '@src/contracts/useContract';
import Label from '@src/components/general/Label/Label';
import TokenViewer3 from '@src/components/nugg/TokenViewer3';
import web3 from '@src/web3';
import useAnimateOverlay from '@src/hooks/useAnimateOverlay';
import { buildTokenIdFactory } from '@src/prototypes';

import styles from './SearchOverlay.styles';

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

const RenderItem: FC<
    ListRenderItemProps<Item, { items: ItemList; type: 'storage' | 'displayed' }, Item>
> = ({ item, action, extraData }) => {
    return (
        <div
            style={{
                borderRadius: lib.layout.borderRadius.medium,
                transition: '.2s background ease',
                position: 'relative',
                margin: '.6rem 1rem',
            }}
        >
            <TokenViewer
                tokenId={item.tokenId}
                style={{ width: '80px', height: '80px', padding: '.3rem' }}
                showLabel
                disableOnClick
            />
            {item.duplicates > 1 && (
                <Label
                    containerStyles={{ position: 'absolute', top: -5, right: -5 }}
                    text={String(item.duplicates)}
                />
            )}
            <Button
                size="small"
                onClick={() => action && action(item)}
                buttonStyle={{
                    borderRadius: lib.layout.borderRadius.large,
                    padding: '.3rem .4rem .3rem .6rem',
                }}
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
        </div>
    );
};

const HotRotateO = () => {
    // const [death, setDeath] = React.useState(false);

    // const [, start] = React.useTransition();

    const openEditScreen = client.editscreen.useEditScreenOpen();
    const tokenId = client.editscreen.useEditScreenTokenId();

    const style = useAnimateOverlay(openEditScreen, {
        zIndex: 998,
    });

    const provider = web3.hook.usePriorityProvider();
    const address = web3.hook.usePriorityAccount();

    const nuggft = useNuggftV1(provider);

    const [needsToClaim, setNeedsToClaim] = React.useState<boolean>();
    const [cannotProveOwnership, setCannotProveOwnership] = React.useState<boolean>();

    const [items, setItems] = useAsyncSetState<ItemList>(() => {
        if (tokenId && provider && address) {
            console.log({ tokenId });
            const fmtTokenId = ethers.BigNumber.from(tokenId.toRawId());

            const floopCheck = async () => {
                return nuggft.floop(fmtTokenId).then((x) => {
                    return x.reduce(
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
                });
            };
            return nuggft.ownerOf(fmtTokenId).then((y) => {
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

    const { send, revert } = useTransactionManager();

    const navigate = useNavigate();

    if (needsToClaim) {
        return (
            <animated.div style={{ ...styles.container, ...style }}>
                <Label text="Needs to claim" />
            </animated.div>
        );
    }

    if (cannotProveOwnership) {
        return (
            <animated.div style={{ ...styles.container, ...style }}>
                <Label text="Canot prove ownership" />
            </animated.div>
        );
    }

    return (
        <animated.div style={{ ...styles.container, ...style }}>
            {tokenId && items && (
                <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                    <RotateOViewer items={items} tokenId={tokenId} />

                    {error && <Label text={error.message} />}

                    {tokenId && openEditScreen && (
                        <List
                            data={items.active}
                            label="displayed"
                            labelStyle={{
                                color: 'white',
                            }}
                            action={(item) => {
                                if (items)
                                    setItems({
                                        active: [
                                            ...items.active.filter(
                                                (x) => x.feature !== item.feature,
                                            ),
                                        ],
                                        hidden: [item, ...items.hidden],
                                        duplicates: items.duplicates,
                                    });
                            }}
                            extraData={{ items, type: 'displayed' as const }}
                            RenderItem={RenderItem}
                            horizontal
                            style={{
                                width: '100%',
                                background: lib.colors.transparentLightGrey,
                                height: '140px',
                                padding: '0rem .4rem',
                                borderRadius: lib.layout.borderRadius.medium,
                            }}
                        />
                    )}
                    {tokenId && openEditScreen && (
                        <List
                            data={items.hidden}
                            label="in storage"
                            labelStyle={{
                                color: 'white',
                            }}
                            extraData={{ items, type: 'storage' as const }}
                            RenderItem={RenderItem}
                            horizontal
                            action={(item) => {
                                if (items)
                                    setItems({
                                        active: [
                                            ...items.active.filter(
                                                (x) => x.feature !== item.feature,
                                            ),
                                            item,
                                        ],
                                        hidden: [
                                            ...items.hidden.filter(
                                                (x) => x.tokenId !== item.tokenId,
                                            ),
                                            ...items.active.filter(
                                                (x) => x.feature === item.feature,
                                            ),
                                        ],
                                        duplicates: items.duplicates,
                                    });
                            }}
                            style={{
                                width: '100%',
                                background: lib.colors.transparentLightGrey,
                                height: '140px',
                                padding: '0rem .4rem',
                                borderRadius: lib.layout.borderRadius.medium,
                            }}
                        />
                    )}
                    {/* <List
                        data={items.duplicates}
                        label="duplicates"
                        labelStyle={{
                            color: 'white',
                        }}
                        extraData={{ items, type: 'displayed' as const }}
                        RenderItem={RenderItem}
                        horizontal
                        style={{
                            width: '100%',
                            background: lib.colors.transparentWhite,
                            padding: '0rem .4rem',
                            borderRadius: lib.layout.borderRadius.medium,
                            justifyContent: 'space-around',
                        }}
                    />
                    <List
                        data={items.hidden}
                        label={t`In storage`}
                        extraData={{ items, type: 'storage' as const }}
                        RenderItem={RenderItem}
                        horizontal
                        action={(item) => {
                            if (items)
                                setItems({
                                    active: [
                                        ...items.active.filter((x) => x.feature !== item.feature),
                                        item,
                                    ],
                                    hidden: [
                                        ...items.hidden.filter((x) => x.id !== item.id),
                                        ...items.active.filter((x) => x.feature === item.feature),
                                    ],
                                    duplicates: items.duplicates,
                                });
                        }}
                        style={{
                            width: '100%',
                            background: lib.colors.transparentWhite,
                            padding: '0rem .4rem',
                            borderRadius: lib.layout.borderRadius.medium,
                        }}
                    />
                    <div
                        style={{
                            display: 'flex',
                            width: '100%',
                            justifyContent: 'space-between',
                            marginTop: '.5rem',
                        }}
                    >
                        <Button
                            buttonStyle={{
                                width: '40%',
                                borderRadius: lib.layout.borderRadius.large,
                            }}
                            textStyle={{ color: lib.colors.nuggRedText }}
                            label={t`Cancel`}
                            onClick={() => {
                                navigate(-1);
                            }}
                        />

                        <Button
                            buttonStyle={{
                                width: '40%',
                                borderRadius: lib.layout.borderRadius.large,
                            }}
                            textStyle={{ color: lib.colors.nuggBlueText }}
                            disabled={!(algo && algo[1] && algo[1].length > 0)}
                            label={t`Save`}
                            onClick={() => {
                                if (algo) {
                                    void send(nuggft.populateTransaction.rotate(...algo));
                                }
                            }}
                        />
                    </div>
                </div>
            )}
        </animated.div>
    );
};

const RotateOViewer = ({ tokenId, items }: { tokenId: TokenId; items: ItemList }) => {
    const provider = web3.hook.usePriorityProvider();

    const dotnugg = useDotnuggV1(provider);

    const [svg] = useAsyncSetState(() => {
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

    return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
            <TokenViewer3
                tokenId={tokenId}
                showcase
                validated
                style={{ height: 300, width: 300 }}
            />
            <TokenViewer
                tokenId={tokenId}
                svgNotFromGraph={svg}
                showcase
                style={{ height: 300, width: 300 }}
            />
        </div>
    );
};

export default HotRotateO;
