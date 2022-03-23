import { animated } from '@react-spring/web';
import React, { FC } from 'react';
import { ethers, BigNumber, BigNumberish } from 'ethers';

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

import styles from './SearchOverlay.styles';

type Item = {
    activeIndex: number;
    id: ItemId;
    position: number;
    feature: number;
    hexId: string;
    desiredIndex?: number;
};

type ItemList = { active: Item[]; hidden: Item[] };

const StoageRenderItem: FC<ListRenderItemProps<Item, undefined, Item>> = ({ item, action }) => {
    return (
        <div
            style={{
                borderRadius: lib.layout.borderRadius.medium,
                transition: '.2s background ease',
            }}
        >
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
            }}
        >
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

export default () => {
    const tokenId = client.live.editingNugg();

    const token = client.live.token(tokenId);

    const style = useAnimateOverlay(!!tokenId, {
        zIndex: 998,
    });

    const nuggft = useNuggftV1();
    const dotnugg = useDotnuggV1();

    const [items, setItems] = useAsyncSetState<ItemList>(() => {
        return tokenId
            ? nuggft.floop(ethers.BigNumber.from(tokenId)).then((x) => {
                  return x.reduce(
                      (prev: ItemList, curr, activeIndex) => {
                          const parsed = parseItmeIdToNum(curr);
                          if (curr === '0x0000') return prev;
                          if (
                              activeIndex < 8 &&
                              !prev.active.find((y) => y.feature === parsed.feature)
                          ) {
                              prev.active.push({
                                  activeIndex,
                                  hexId: curr,
                                  id: `item-${Number(curr)}`,
                                  ...parsed,
                              });
                          } else {
                              prev.hidden.push({
                                  activeIndex,
                                  hexId: curr,

                                  id: `item-${Number(curr)}`,
                                  ...parsed,
                              });
                          }
                          return prev;
                      },
                      { active: [], hidden: [] },
                  );
              })
            : undefined;
    }, [tokenId, nuggft]);

    const algo: Parameters<typeof nuggft.rotate> | undefined = React.useMemo(() => {
        if (items && tokenId) {
            const active = items.active.map((x, i) => ({ ...x, desiredIndex: i }));
            const hidden = items.hidden.map((x, i) => ({ ...x, desiredIndex: i + 8 }));

            const current = [...active, ...hidden].reduce((prev: (Item | undefined)[], curr) => {
                // eslint-disable-next-line no-param-reassign
                prev[curr.activeIndex] = curr;
                return prev;
            }, new Array(16).fill(undefined) as undefined[]);
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

    const [svg, setSvg] = useAsyncSetState(() => {
        const arr: BigNumberish[] = new Array<BigNumberish>(8);

        if (items && items.active) {
            for (let i = 0; i < 8; i++) {
                arr[i] = BigNumber.from(items.active.find((x) => x.feature === i)?.hexId ?? 0).and(
                    0xff,
                );
            }
            return dotnugg['exec(uint8[8],bool)'](
                arr as Parameters<typeof dotnugg['exec(uint8[8],bool)']>[0],
                true,
            ) as Promise<Base64EncodedSvg>;
        }

        return undefined;
    }, [items]);

    const { send, revert } = useTransactionManager();
    const toggleEditingNugg = client.mutate.toggleEditingNugg();

    // const [waiting, setWaiting] = React.useState<boolean>();

    return (
        <animated.div style={{ ...styles.container, ...style }}>
            {token && tokenId && items && (
                <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column' }}>
                    <Button
                        label="kill"
                        onClick={() => {
                            toggleEditingNugg(undefined);
                        }}
                    />

                    {algo && algo[1] && algo[1].length > 0 && (
                        <Button
                            label="save"
                            onClick={() => {
                                void setSvg(undefined);
                                void send(nuggft.populateTransaction.rotate(...algo));
                            }}
                        />
                    )}

                    {!svg ? (
                        <TokenViewer3 tokenId={tokenId} showcase validated />
                    ) : (
                        <TokenViewer tokenId={tokenId} svgNotFromGraph={svg} showcase />
                    )}

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
                </div>
            )}
        </animated.div>
    );
};
