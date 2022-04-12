import { animated } from '@react-spring/web';
import React, { FC, useMemo } from 'react';
import { ethers, BigNumber, BigNumberish } from 'ethers';
import { useNavigate, useMatch } from 'react-router-dom';

import useAnimateOverlay from '@src/hooks/useAnimateOverlay';
import client from '@src/client';
import TokenViewer from '@src/components/nugg/TokenViewer';
import Button from '@src/components/general/Buttons/Button/Button';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import lib, { parseItmeIdToNum } from '@src/lib';
import { useAsyncSetState } from '@src/hooks/useAsyncState';
import { useNuggftV1, useDotnuggV1, useTransactionManager } from '@src/contracts/useContract';
import { ItemId } from '@src/client/router';
import Label from '@src/components/general/Label/Label';
import TokenViewer3 from '@src/components/nugg/TokenViewer3';
import web3 from '@src/web3';

import styles from './SearchOverlay.styles';

type Item = {
    activeIndex: number;
    id: ItemId;
    position: number;
    feature: number;
    hexId: number;
    desiredIndex?: number;
    duplicates: number;
};

type ItemList = { active: Item[]; hidden: Item[]; duplicates: Item[] };

const StoageRenderItem: FC<ListRenderItemProps<Item, undefined, Item>> = ({ item, action }) => {
    return (
        <div
            style={{
                borderRadius: lib.layout.borderRadius.medium,
                transition: '.2s background ease',
                position: 'relative',
            }}
        >
            {item.duplicates > 1 && (
                <Label
                    containerStyles={{ position: 'absolute', top: 5, right: 5 }}
                    text={String(item.duplicates)}
                />
            )}
            <TokenViewer
                tokenId={item.id}
                style={{ width: '80px', height: '80px' }}
                showLabel
                disableOnClick
            />
            <Button onClick={() => action && action(item)} label="View" />
        </div>
    );
};

const DisplayedRenderItem: FC<ListRenderItemProps<Item, undefined, Item>> = ({ item, action }) => {
    return (
        <div
            style={{
                borderRadius: lib.layout.borderRadius.medium,
                transition: '.2s background ease',
                position: 'relative',
            }}
        >
            {item.duplicates > 1 && (
                <Label
                    containerStyles={{ position: 'absolute', top: 5, right: 0 }}
                    text={String(item.duplicates)}
                />
            )}

            <TokenViewer
                tokenId={item.id}
                style={{ width: '80px', height: '80px' }}
                showLabel
                disableOnClick
            />

            <Button onClick={() => action && action(item)} label="deselect" />
        </div>
    );
};

// const DuplicateRenderItem: FC<ListRenderItemProps<Item, undefined, undefined>> = ({ item }) => {
//     return (
//         <div
//             style={{
//                 borderRadius: lib.layout.borderRadius.medium,
//                 transition: '.2s background ease',
//             }}
//         >
//             <TokenViewer
//                 tokenId={item.id}
//                 style={{ width: '80px', height: '80px' }}
//                 showLabel
//                 disableOnClick
//             />
//         </div>
//     );
// };

export default () => {
    const match = useMatch('/edit/:id');

    const tokenId = useMemo(() => {
        return match?.params.id || undefined;
    }, [match]);

    const style = useAnimateOverlay(true, {
        zIndex: 998,
    });

    const provider = web3.hook.usePriorityProvider();
    const address = web3.hook.usePriorityAccount();

    const nuggft = useNuggftV1(provider);
    const dotnugg = useDotnuggV1(provider);

    const [needsToClaim, setNeedsToClaim] = React.useState<boolean>();
    const [cannotProveOwnership, setCannotProveOwnership] = React.useState<boolean>();

    const [items, setItems] = useAsyncSetState<ItemList>(() => {
        if (tokenId && provider && address) {
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
                                prev.active.push({
                                    duplicates: 1,
                                    activeIndex,
                                    hexId: curr,
                                    id: `item-${Number(curr)}`,
                                    ...parsed,
                                });
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
                                prev.hidden.push({
                                    activeIndex,
                                    hexId: curr,
                                    duplicates: 1,

                                    id: `item-${Number(curr)}`,
                                    ...parsed,
                                });
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
                                prev.duplicates.push({
                                    duplicates: 0,
                                    activeIndex,
                                    hexId: curr,
                                    id: `item-${Number(curr)}`,
                                    ...parsed,
                                });
                            }
                            return prev;
                        },
                        { active: [], hidden: [], duplicates: [] },
                    );
                });
            };
            const fmtTokenId = ethers.BigNumber.from(tokenId);
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
            return [BigNumber.from(tokenId), moves.map((x) => x.from), moves.map((x) => x.to)];
        }
        return undefined;
    }, [items, tokenId]);

    const [svg] = useAsyncSetState(() => {
        const arr: BigNumberish[] = new Array<BigNumberish>(8);

        if (provider) {
            if (items && items.active) {
                for (let i = 0; i < 8; i++) {
                    arr[i] = BigNumber.from(
                        items.active.find((x) => x.feature === i)?.hexId ?? 0,
                    ).and(0xff);
                }
                return dotnugg['exec(uint8[8],bool)'](
                    arr as Parameters<typeof dotnugg['exec(uint8[8],bool)']>[0],
                    true,
                ) as Promise<Base64EncodedSvg>;
            }
        }

        return undefined;
    }, [items, dotnugg, provider]);

    const { send, revert } = useTransactionManager();

    const navigate = useNavigate();
    const lastSwap = client.live.lastSwap.tokenId();

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
                    <Button
                        label="kill"
                        onClick={() => {
                            if (lastSwap) navigate(`/swap/${lastSwap}`);
                            else navigate('/');
                        }}
                    />

                    {algo && algo[1] && algo[1].length > 0 && (
                        <Button
                            label="save"
                            onClick={() => {
                                void send(nuggft.populateTransaction.rotate(...algo));
                            }}
                        />
                    )}

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

                    {revert && <Label text={revert.message} />}

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
                                        ...items.active.filter((x) => x.feature !== item.feature),
                                    ],
                                    hidden: [item, ...items.hidden],
                                    duplicates: items.duplicates,
                                });
                        }}
                        extraData={undefined}
                        RenderItem={DisplayedRenderItem}
                        horizontal
                        style={{
                            width: '100%',
                            background: lib.colors.transparentLightGrey,
                            height: '140px',
                            padding: '0rem .4rem',
                            borderRadius: lib.layout.borderRadius.medium,
                        }}
                    />
                    <List
                        data={items.hidden}
                        label="in storage"
                        labelStyle={{
                            color: 'white',
                        }}
                        extraData={undefined}
                        RenderItem={StoageRenderItem}
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
                            background: lib.colors.transparentLightGrey,
                            height: '140px',
                            padding: '0rem .4rem',
                            borderRadius: lib.layout.borderRadius.medium,
                        }}
                    />
                    {/* <List
                        data={items.duplicates}
                        label="duplicates"
                        labelStyle={{
                            color: 'white',
                        }}
                        extraData={undefined}
                        RenderItem={DisplayedRenderItem}
                        horizontal
                        style={{
                            width: '100%',
                            background: lib.colors.transparentLightGrey,
                            height: '140px',
                            padding: '0rem .4rem',
                            opacity: 0.7,
                            borderRadius: lib.layout.borderRadius.medium,
                        }}
                    /> */}
                </div>
            )}
        </animated.div>
    );
};
