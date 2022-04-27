import React, { FC } from 'react';
import { t } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';

import Button from '@src/components/general/Buttons/Button/Button';
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib';
import TokenViewer from '@src/components/nugg/TokenViewer';
import List, { ListRenderItemProps } from '@src/components/general/List/List';
import { TryoutData } from '@src/client/interfaces';
import CurrencyText from '@src/components/general/Texts/CurrencyText/CurrencyText';
import web3 from '@src/web3';
import client from '@src/client';
import { useDarkMode } from '@src/client/hooks/useDarkMode';
import useRemaining from '@src/client/hooks/useRemaining';
import useDimentions from '@src/client/hooks/useDimentions';
import { ModalEnum } from '@src/interfaces/modals';
import { buildTokenIdFactory } from '@src/prototypes';

import styles from './RingAbout.styles';

const TryoutRenderItem: FC<ListRenderItemProps<TryoutData, undefined, TryoutData>> = ({
    item: tryoutData,
    selected,
    action,
}) => {
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

            <CurrencyText
                textStyle={{ fontSize: '10px' }}
                value={tryoutData.eth.number}
                stopAnimation
            />
        </div>
    );
};

export default ({ tokenId }: { tokenId?: ItemId }) => {
    const { isPhone } = useDimentions();
    const address = web3.hook.usePriorityAccount();
    const epoch = client.live.epoch.id();
    const swap = client.swaps.useSwap(tokenId);

    const token = client.live.token(tokenId);
    const [nuggToBuyFrom, setNuggToBuyFrom] = React.useState<TryoutData>();
    const openModal = client.modal.useOpenModal();

    const { minutes } = useRemaining(client.live.epoch.default());

    const darkmode = useDarkMode();

    const [showBody, setShowBody] = React.useState(true);

    const dynamicTextColor = React.useMemo(() => {
        if (isPhone) {
            return lib.colors.primaryColor;
        }
        return lib.colors.white;
    }, [swap, isPhone]);

    const mustWaitToBid = React.useMemo(() => {
        return (
            token &&
            epoch &&
            token.activeSwap !== undefined &&
            token.activeSwap.endingEpoch !== epoch
        );
    }, [token, epoch]);

    const navigate = useNavigate();
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
                <div style={{ width: '100%' }}>
                    <List
                        data={token.tryout.swaps}
                        labelStyle={{
                            color: dynamicTextColor,
                        }}
                        // label={t`Select a nugg to buy this item from`}
                        extraData={undefined}
                        RenderItem={TryoutRenderItem}
                        selected={nuggToBuyFrom}
                        action={setNuggToBuyFrom}
                        horizontal
                        style={{
                            width: '100%',

                            marginTop: '20px',
                            background: lib.colors.transparentLightGrey,
                            height: '100px',
                            padding: '0rem .3rem',
                            borderRadius: lib.layout.borderRadius.medium,
                        }}
                    />
                    <Button
                        buttonStyle={{
                            ...styles.button,
                            ...(isPhone && {
                                border: `5px solid ${lib.colors.nuggBlueSemiTransparent}`,
                                // borderRadius: lib.layout.borderRadius.medium,
                            }),
                        }}
                        textStyle={{
                            ...styles.buttonText,
                        }}
                        disabled={mustWaitToBid || !nuggToBuyFrom}
                        onClick={() => {
                            if (nuggToBuyFrom) {
                                if (isPhone && isUndefinedOrNullOrStringEmpty(address))
                                    navigate('/wallet');
                                else if (tokenId)
                                    openModal(
                                        buildTokenIdFactory({
                                            modalType: ModalEnum.Offer as const,
                                            tokenId,
                                            token,
                                            nuggToBuyFrom: nuggToBuyFrom.nugg,
                                        }),
                                    );
                            }
                        }}
                        label={
                            mustWaitToBid
                                ? t`wait ${minutes} minutes to buy from a new nugg`
                                : isPhone && isUndefinedOrNullOrStringEmpty(address)
                                ? t`Connect wallet`
                                : !swap?.endingEpoch
                                ? 'Accept and Start Auction'
                                : t`Place offer`
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
