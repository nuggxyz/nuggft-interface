import React, { FC } from 'react';
import { t } from '@lingui/macro';

import Button from '@src/components/general/Buttons/Button/Button';
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import TokenViewer from '@src/components/nugg/TokenViewer';
import { MyNuggsData, TryoutData } from '@src/client/interfaces';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import web3 from '@src/web3';
import client from '@src/client';
import useDimensions from '@src/client/hooks/useDimensions';
import { ModalEnum } from '@src/interfaces/modals';
import { buildTokenIdFactory } from '@src/prototypes';
import { EthInt } from '@src/classes/Fraction';
import Label from '@src/components/general/Label/Label';
import { Page } from '@src/interfaces/nuggbook';
import GodListHorizontal from '@src/components/general/List/GodListHorizontal';
import { GodListRenderItemProps } from '@src/components/general/List/GodList';

const TryoutRenderItem: FC<GodListRenderItemProps<TryoutData, undefined, number>> = ({
    item: tryoutData,
    selected,
    action,
    index,
}) => {
    const usd = client.usd.useUsdPair(tryoutData?.eth);
    return (
        <div
            style={{
                alignSelf: 'center',
                borderRadius: lib.layout.borderRadius.medium,
                transition: '.2s background ease',
                background: selected ? lib.colors.transparentGrey2 : lib.colors.transparent,
                padding: '10px',
            }}
            aria-hidden="true"
            onClick={() => action && action(index)}
        >
            <TokenViewer
                tokenId={tryoutData?.nugg}
                style={{ width: '60px', height: '60px' }}
                disableOnClick
            />

            <CurrencyText textStyle={{ fontSize: '10px' }} value={usd} stopAnimation />
        </div>
    );
};

const MyNuggRenderItem: FC<GodListRenderItemProps<FormatedMyNuggsData, undefined, number>> = ({
    item,
    selected,
    action,
    index,
}) => {
    const disabled = React.useMemo(() => {
        if (item?.activeSwap) return t`currenlty for sale`;
        if (item?.lastBid === 'unable-to-bid') return t`previous claim pending for this item`;
        return undefined;
    }, [item]);

    return (
        <div
            style={{
                alignSelf: 'center',
                borderRadius: lib.layout.borderRadius.medium,
                transition: '.2s background ease',
                background: selected ? lib.colors.transparentGrey2 : lib.colors.transparent,
                padding: '10px',
            }}
            aria-hidden="true"
            onClick={() => action && action(index)}
        >
            <TokenViewer
                tokenId={item?.tokenId}
                style={{ width: '60px', height: '60px' }}
                // showLabel
                disableOnClick
            />
            {disabled && <Label text={disabled} containerStyles={{ background: 'transparent' }} />}

            {/* <CurrencyText textStyle={{ fontSize: '10px' }} value={usd} stopAnimation /> */}
        </div>
    );
};

type FormatedMyNuggsData = MyNuggsData & { lastBid: EthInt | 'unable-to-bid' | 'user-must-claim' };

export default ({
    tokenId,
    onContinue,
    onSelectNugg,
    onSelectMyNugg,
}: {
    tokenId?: ItemId;
    onSelectNugg?: (dat?: TryoutData) => void;
    onContinue?: () => void;
    onSelectMyNugg?: (tokenId?: NuggId) => void;
}) => {
    const { isPhone } = useDimensions();
    const address = web3.hook.usePriorityAccount();
    const epoch = client.epoch.active.useId();
    const { minutes } = client.epoch.useEpoch(epoch);
    const swap = client.swaps.useSwap(tokenId);

    const myNuggs = client.live.myNuggs();

    const token = client.live.token(tokenId);
    const [nuggToBuyFrom, setNuggToBuyFrom] = React.useState<NuggId>();
    const [selectedMyNugg, setSelectedMyNugg] = React.useState<NuggId>();
    const [continued, setContinued] = React.useState<boolean>(false);
    const openModal = client.modal.useOpenModal();

    const mustWaitToBid = React.useMemo(() => {
        return (
            token &&
            epoch &&
            token.activeSwap !== undefined &&
            token.activeSwap.endingEpoch !== epoch
        );
    }, [token, epoch]);

    const nuggbookOpen = client.nuggbook.useGotoOpen();

    const myNuggsFormatted = React.useMemo(() => {
        const nuggId = nuggToBuyFrom;

        return myNuggs.map((x) => {
            const filt = x.unclaimedOffers.filter((y) => {
                return y.itemId === tokenId;
            });

            return {
                ...x,
                lastBid: x.pendingClaim
                    ? ('user-must-claim' as const)
                    : filt.length === 0
                    ? new EthInt(0)
                    : filt[0].sellingNuggId === nuggId
                    ? new EthInt(filt[0]?.eth || 0)
                    : ('unable-to-bid' as const),
            };
        });
    }, [nuggToBuyFrom, myNuggs, tokenId]);

    const [RenderItem, action, data] = React.useMemo(() => {
        if (continued) {
            return [
                MyNuggRenderItem,
                (dat: number | undefined) => {
                    if (dat !== undefined) {
                        const got = myNuggsFormatted[dat];
                        setSelectedMyNugg(got.tokenId);
                        if (onSelectMyNugg) onSelectMyNugg(got.tokenId);
                    }
                },
                myNuggsFormatted,
            ] as const;
        }

        return [
            TryoutRenderItem,
            (dat: number | undefined) => {
                if (dat !== undefined) {
                    const got = token?.tryout.swaps[dat];
                    setNuggToBuyFrom(got?.nugg);
                    if (onSelectNugg) onSelectNugg(got);
                }
            },
            token?.tryout.swaps || [],
        ] as const;
    }, [token?.tryout.swaps, myNuggsFormatted, continued]);

    return (
        <div
            style={{
                marginTop: isPhone ? 0 : '20px',
                width: '90%',
                // height: !isPhone && !tokenId ? '0px' : '100%',
            }}
        >
            <div style={{ marginTop: '20px' }}>
                <GodListHorizontal
                    // @ts-ignore
                    data={data}
                    extraData={undefined}
                    // @ts-ignore
                    RenderItem={RenderItem}
                    horizontal
                    startGap={10}
                    itemHeight={90}
                    // @ts-ignore
                    action={action}
                    selected={selectedMyNugg}
                    style={React.useMemo(
                        () => ({
                            width: '100%',
                            background: lib.colors.transparentLightGrey,
                            height: isPhone ? '100px' : '140px',
                            padding: '15px 0rem .4rem',
                            borderRadius: lib.layout.borderRadius.medium,
                        }),
                        [isPhone],
                    )}
                />

                <Button
                    buttonStyle={{
                        borderRadius: lib.layout.borderRadius.large,
                        width: '100%',
                        marginTop: '.5rem',
                        zIndex: 500,
                        // border: `5px solid ${lib.colors.nuggBlueSemiTransparent}`,
                        background: lib.colors.primaryColor,
                    }}
                    textStyle={{
                        color: lib.colors.white,
                    }}
                    disabled={mustWaitToBid || !nuggToBuyFrom || (continued && !selectedMyNugg)}
                    onClick={() => {
                        if (nuggToBuyFrom) {
                            if (isPhone && isUndefinedOrNullOrStringEmpty(address))
                                nuggbookOpen(Page.Connect);
                            else if (!continued) {
                                setContinued(true);
                                if (onContinue) onContinue();
                            } else if (tokenId && selectedMyNugg && token)
                                openModal(
                                    buildTokenIdFactory({
                                        modalType: ModalEnum.Offer as const,
                                        tokenId,
                                        token,
                                        nuggToBuyFrom,
                                        nuggToBuyFor: selectedMyNugg,
                                        endingEpoch: token.activeSwap?.epoch?.id ?? null,
                                    }),
                                );
                        }
                    }}
                    label={
                        continued
                            ? selectedMyNugg
                                ? t`review`
                                : t`select a nugg from your roost`
                            : mustWaitToBid
                            ? t`wait ${minutes} min`
                            : isPhone && isUndefinedOrNullOrStringEmpty(address)
                            ? t`connect wallet`
                            : !nuggToBuyFrom
                            ? t`select a nugg`
                            : !swap?.endingEpoch
                            ? t`continue`
                            : t`place offer`
                    }
                />
            </div>
        </div>
    );
};
