import React, { FC } from 'react';
import { t } from '@lingui/macro';

import Button from '@src/components/general/Buttons/Button/Button';
import lib from '@src/lib';
import TokenViewer from '@src/components/nugg/TokenViewer';
import { TryoutData } from '@src/client/interfaces';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import client from '@src/client';
import { useDarkMode } from '@src/client/hooks/useDarkMode';
import useDimensions from '@src/client/hooks/useDimensions';
import { ModalEnum } from '@src/interfaces/modals';
import { buildTokenIdFactory } from '@src/prototypes';
import GodListHorizontal from '@src/components/general/List/GodListHorizontal';
import { GodListRenderItemProps } from '@src/components/general/List/GodList';

import styles from './RingAbout.styles';

const TryoutRenderItem: FC<GodListRenderItemProps<TryoutData, undefined, TryoutData>> = ({
    item: tryoutData,
    selected,
    action,
}) => {
    const usd = client.usd.useUsdPair(tryoutData?.eth);
    return (
        <div
            style={{
                borderRadius: lib.layout.borderRadius.medium,
                transition: '.2s background ease',
                backgroundColor: selected ? lib.colors.transparentWhite : lib.colors.transparent,
                padding: '10px',
                cursor: 'pointer',
            }}
            aria-hidden="true"
            onClick={() => action && action(tryoutData)}
        >
            <TokenViewer
                tokenId={tryoutData?.nugg}
                style={{ width: '60px', height: '60px' }}
                disableOnClick
                showLabel
                textProps={{ size: 'smaller' }}
            />

            <CurrencyText
                textStyle={{
                    fontSize: '10px',
                    backgroundColor: lib.colors.transparentWhite,
                    borderRadius: lib.layout.borderRadius.large,
                    padding: '0rem .2rem',
                    marginTop: '.2rem',
                }}
                value={usd}
                stopAnimation
            />
        </div>
    );
};

export default ({
    tokenId,
    onSelectNugg,
}: {
    tokenId?: ItemId;
    onSelectNugg?: (dat: TryoutData) => void;
    onContinue?: () => void;
    onSelectMyNugg?: (tokenId: NuggId) => void;
}) => {
    const { isPhone } = useDimensions();
    const epoch = client.epoch.active.useId();
    const token = client.live.token(tokenId);
    const [nuggToBuyFrom, setNuggToBuyFrom] = React.useState<TryoutData>();
    const openModal = client.modal.useOpenModal();
    const { minutes } = client.epoch.useEpoch(epoch);

    const darkmode = useDarkMode();

    const [showBody, setShowBody] = React.useState(false);

    const mustWaitToBid = React.useMemo(() => {
        return (
            token &&
            epoch &&
            token.activeSwap !== undefined &&
            token.activeSwap.endingEpoch !== epoch
        );
    }, [token, epoch]);

    return token && token.type === 'item' && token.tryout.count > 0 ? (
        <div
            style={{
                ...(!isPhone && (darkmode ? styles.containerDark : styles.container)),
                ...(isPhone && {
                    ...styles.mobile,
                }),
                marginTop: '20px',
            }}
        >
            {showBody ? (
                <div style={{ width: '100%' }}>
                    <GodListHorizontal
                        data={token.tryout.swaps}
                        itemHeight={105}
                        labelStyle={{ color: 'white', paddingTop: '0rem' }}
                        label={
                            mustWaitToBid
                                ? t`Wait ${minutes} min`
                                : nuggToBuyFrom
                                ? t`Purchase item from ${nuggToBuyFrom.nugg.toPrettyId()}`
                                : t`Select a nugg to buy this item from`
                        }
                        extraData={undefined}
                        RenderItem={TryoutRenderItem}
                        selected={nuggToBuyFrom}
                        action={(dat?: TryoutData) => {
                            setNuggToBuyFrom(dat);
                            if (onSelectNugg && dat) onSelectNugg(dat);
                        }}
                        horizontal
                        style={{
                            width: '100%',
                            background: lib.colors.transparentLightGrey,
                            height: '120px',
                            padding: '0rem .3rem',
                            borderRadius: lib.layout.borderRadius.medium,
                        }}
                    />
                    <Button
                        buttonStyle={{
                            ...styles.button,
                            ...(isPhone && {
                                background: lib.colors.primaryColor,
                            }),
                        }}
                        textStyle={{
                            ...styles.buttonText,
                            ...(isPhone && {
                                color: lib.colors.white,
                            }),
                        }}
                        disabled={mustWaitToBid || !nuggToBuyFrom}
                        onClick={() => {
                            if (nuggToBuyFrom && tokenId && token) {
                                openModal(
                                    buildTokenIdFactory({
                                        modalType: ModalEnum.Offer as const,
                                        tokenId,
                                        token,
                                        nuggToBuyFrom: nuggToBuyFrom.nugg,
                                        // nuggToBuyFor: null,
                                        endingEpoch: token.activeSwap?.endingEpoch ?? null,
                                    }),
                                );
                            }
                        }}
                        label={t`Place offer`}
                    />
                </div>
            ) : (
                <Button
                    buttonStyle={{
                        ...styles.button,
                        ...(isPhone && {
                            background: lib.colors.primaryColor,
                        }),
                    }}
                    textStyle={{
                        ...styles.buttonText,
                        ...(isPhone && {
                            color: lib.colors.white,
                        }),
                    }}
                    onClick={() => setShowBody(true)}
                    label={t`${token.tryout.swaps.length} other nuggs are selling this item`}
                />
            )}
        </div>
    ) : null;
};
