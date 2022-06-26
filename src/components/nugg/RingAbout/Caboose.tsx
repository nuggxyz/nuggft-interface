import React, { FC } from 'react';
import { t } from '@lingui/macro';

import Button from '@src/components/general/Buttons/Button/Button';
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import TokenViewer from '@src/components/nugg/TokenViewer';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import { MyNuggsData, TryoutData } from '@src/client/interfaces';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import web3 from '@src/web3';
import client from '@src/client';
import { useDarkMode } from '@src/client/hooks/useDarkMode';
import useDimensions from '@src/client/hooks/useDimensions';
import { ModalEnum } from '@src/interfaces/modals';
import { buildTokenIdFactory } from '@src/prototypes';
import { EthInt } from '@src/classes/Fraction';
import Label from '@src/components/general/Label/Label';
import { Page } from '@src/interfaces/nuggbook';

import styles from './RingAbout.styles';

const TryoutRenderItem: FC<ListRenderItemProps<TryoutData, undefined, TryoutData>> = ({
    item: tryoutData,
    selected,
    action,
}) => {
    const usd = client.usd.useUsdPair(tryoutData.eth);
    return (
        <div
            style={{
                borderRadius: lib.layout.borderRadius.medium,
                transition: '.2s background ease',
                background: selected ? lib.colors.transparentGrey2 : lib.colors.transparent,
                padding: '10px',
            }}
            aria-hidden="true"
            onClick={() => action && action(tryoutData)}
        >
            <TokenViewer
                tokenId={tryoutData.nugg}
                style={{ width: '60px', height: '60px' }}
                disableOnClick
            />

            <CurrencyText textStyle={{ fontSize: '10px' }} value={usd} stopAnimation />
        </div>
    );
};

const MyNuggRenderItem: FC<
    ListRenderItemProps<FormatedMyNuggsData, undefined, FormatedMyNuggsData>
> = ({ item, selected, action }) => {
    const disabled = React.useMemo(() => {
        if (item.activeSwap) return t`currenlty for sale`;
        if (item.lastBid === 'unable-to-bid') return t`previous claim pending for this item`;
        return undefined;
    }, [item]);

    const { screen: screenType } = useDimensions();

    return (
        <Button
            disabled={!!disabled}
            buttonStyle={{
                background: selected ? lib.colors.transparentGrey2 : lib.colors.transparent,
                borderRadius: lib.layout.borderRadius.medium,
                transition: '.2s background ease',
            }}
            rightIcon={
                <>
                    <TokenViewer
                        tokenId={item.tokenId}
                        style={
                            screenType !== 'phone'
                                ? { width: '80px', height: '80px' }
                                : { width: '60px', height: '60px' }
                        }
                        // showLabel
                        disableOnClick
                    />
                    {disabled && (
                        <Label text={disabled} containerStyles={{ background: 'transparent' }} />
                    )}
                </>
            }
            onClick={() => action && action(item)}
        />
    );
};
type FormatedMyNuggsData = MyNuggsData & { lastBid: EthInt | 'unable-to-bid' | 'user-must-claim' };

export default ({
    tokenId,
    onSelectNugg,
    onContinue,
    onSelectMyNugg,
}: {
    tokenId?: ItemId;
    onSelectNugg?: (dat: TryoutData) => void;
    onContinue?: () => void;
    onSelectMyNugg?: (tokenId: NuggId) => void;
}) => {
    const { isPhone } = useDimensions();
    const address = web3.hook.usePriorityAccount();
    const epoch = client.epoch.active.useId();
    const { minutes } = client.epoch.useEpoch(epoch);
    const token = client.live.token(tokenId);

    const swap = React.useMemo(() => {
        return token?.activeSwap;
    }, [token?.activeSwap]);

    const myNuggs = client.user.useNuggs();

    const [nuggToBuyFrom, setNuggToBuyFrom] = React.useState<TryoutData>();
    const [selectedMyNugg, setSelectedMyNugg] = React.useState<FormatedMyNuggsData>();
    const [continued, setContinued] = React.useState<boolean>(false);
    const openModal = client.modal.useOpenModal();

    const darkmode = useDarkMode();

    const [showBody, setShowBody] = React.useState(true);

    // const dynamicTextColor = React.useMemo(() => {
    //     if (isPhone) {
    //         return lib.colors.primaryColor;
    //     }
    //     return lib.colors.white;
    // }, [swap, isPhone]);

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

        return (
            [...myNuggs]
                .map((x) => {
                    const filt = x.unclaimedOffers.filter((y) => {
                        return y.itemId === tokenId;
                    });

                    return {
                        ...x,
                        lastBid: x.pendingClaim
                            ? ('user-must-claim' as const)
                            : filt.length === 0
                            ? new EthInt(0)
                            : filt[0].sellingNuggId === nuggId?.nugg
                            ? new EthInt(filt[0]?.eth || 0)
                            : ('unable-to-bid' as const),
                    };
                })
                // .filter((x) => x.lastBid !== 'user-must-claim')
                .first(5) as FormatedMyNuggsData[]
        );
    }, [myNuggs]);

    return token && token.type === 'item' && token.tryout.count > 0 ? (
        <div
            style={{
                ...(!isPhone && (darkmode ? styles.containerDark : styles.container)),
                ...(isPhone && {
                    ...styles.mobile,
                }),
                marginTop: isPhone ? 0 : '20px',
                width: '90%',
            }}
        >
            {showBody ? (
                <div style={{ width: '100%', marginTop: '20px' }}>
                    {continued ? (
                        <List
                            data={myNuggsFormatted}
                            extraData={undefined}
                            RenderItem={MyNuggRenderItem}
                            horizontal
                            action={(dat) => {
                                setSelectedMyNugg(dat);
                                if (onSelectMyNugg) onSelectMyNugg(dat.tokenId);
                            }}
                            selected={selectedMyNugg}
                            style={{
                                width: '100%',
                                background: lib.colors.transparentLightGrey,
                                height: isPhone ? '100px' : '140px',
                                padding: '0rem .4rem',
                                borderRadius: lib.layout.borderRadius.medium,
                            }}
                        />
                    ) : (
                        <List
                            data={token.tryout.swaps}
                            // label={t`Select a nugg to buy this item from`}
                            extraData={undefined}
                            RenderItem={TryoutRenderItem}
                            selected={nuggToBuyFrom}
                            action={(dat: TryoutData) => {
                                setNuggToBuyFrom(dat);
                                if (onSelectNugg) onSelectNugg(dat);
                            }}
                            horizontal
                            style={{
                                width: '100%',

                                background: lib.colors.transparentLightGrey,
                                height: '100px',
                                padding: '0rem .3rem',
                                borderRadius: lib.layout.borderRadius.medium,
                            }}
                        />
                    )}
                    <Button
                        buttonStyle={{
                            ...styles.button,
                            ...(isPhone && {
                                // border: `5px solid ${lib.colors.nuggBlueSemiTransparent}`,
                                background: lib.colors.primaryColor,
                            }),
                        }}
                        textStyle={{
                            ...styles.buttonText,
                            ...(isPhone && {
                                color: lib.colors.white,
                            }),
                        }}
                        disabled={mustWaitToBid || !nuggToBuyFrom || (continued && !selectedMyNugg)}
                        onClick={() => {
                            if (nuggToBuyFrom) {
                                if (isPhone && isUndefinedOrNullOrStringEmpty(address))
                                    nuggbookOpen(Page.Connect);
                                else if (!continued) {
                                    setContinued(true);
                                    if (onContinue) onContinue();
                                } else if (tokenId && selectedMyNugg)
                                    openModal(
                                        buildTokenIdFactory({
                                            modalType: ModalEnum.Offer as const,
                                            tokenId,
                                            token,
                                            nuggToBuyFrom: nuggToBuyFrom.nugg,
                                            nuggToBuyFor: selectedMyNugg?.tokenId,
                                            endingEpoch: token.activeSwap?.endingEpoch ?? null,
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
            ) : (
                <Button
                    onClick={() => setShowBody(true)}
                    label="4 other nuggs are selling this item"
                />
            )}
        </div>
    ) : null;
};
