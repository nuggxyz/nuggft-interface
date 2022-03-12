import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { animated, config, useSpring } from '@react-spring/web';

import {
    isUndefinedOrNull,
    isUndefinedOrNullOrStringEmpty,
    isUndefinedOrNullOrNotString,
} from '@src/lib';
import useOnClickOutside from '@src/hooks/useOnClickOutside';
import usePrevious from '@src/hooks/usePrevious';
import OfferModal from '@src/components/nugg/Modals/OfferModal/OfferModal';
import AppState from '@src/state/app';
import LoanOrBurnModal from '@src/components/nugg/Modals/LoanOrBurnModal/LoanOrBurnModal';
import useAnimateOverlay from '@src/hooks/useAnimateOverlay';
import LoanInputModal from '@src/components/nugg/Modals/LoanInputModal/LoanInputModal';
import QrCodeModal from '@src/components/nugg/Modals/QrCodeModal/QrCodeModal';
import { TokenId } from '@src/client/router';
import SellNuggOrItemModal from '@src/components/nugg/Modals/SellNuggOrItemModal/SellNuggOrItemModal';

import styles from './Modal.styles';

type Props = {};

const Modal: FunctionComponent<Props> = () => {
    const isOpen = AppState.select.modalIsOpen();
    const data = AppState.select.modalData();
    const [currentModal, setCurrentModal] = useState<NL.Redux.App.ModalNames>();
    const previousOpen = usePrevious(isOpen);
    const node = useRef<HTMLDivElement>(null);
    const screenType = AppState.select.screenType();

    useEffect(() => {
        if (isUndefinedOrNull(isOpen) && !isUndefinedOrNullOrStringEmpty(previousOpen)) {
            const timeout = setTimeout(() => setCurrentModal(undefined), 1000);
            return () => clearTimeout(timeout);
        } else {
            setCurrentModal(isOpen);
        }
    }, [isOpen, previousOpen]);

    const containerStyle = useSpring({
        to: {
            ...styles.container,
            ...(screenType === 'phone' ? styles.containerMobile : styles.containerFull),
            transform: isOpen
                ? screenType === 'phone'
                    ? 'translate(0px, 18px)'
                    : 'translate(8px, 8px)'
                : 'translate(36px, 36px)',
            ...data.containerStyle,
        },
        config: config.default,
    });
    const containerBackgroundStyle = useSpring({
        to: {
            ...styles.containerBackground,
            transform: isOpen ? 'translate(-4px, -4px)' : 'translate(-24px, -24px)',
            ...(screenType === 'phone' ? styles.containerMobile : styles.containerFull),
        },
        config: config.default,
    });

    const closeModal = useCallback(
        () => !isUndefinedOrNullOrNotString(isOpen) && AppState.dispatch.setModalClosed(),
        [isOpen],
    );

    const style = useAnimateOverlay(!isUndefinedOrNullOrStringEmpty(isOpen));

    useOnClickOutside(node, closeModal);

    return (
        <animated.div style={style}>
            <div
                style={{
                    position: 'relative',
                    ...(screenType === 'phone' && {
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                    }),
                }}
            >
                {screenType !== 'phone' && (
                    <animated.div
                        style={{ ...containerBackgroundStyle, ...data.backgroundStyle }}
                    />
                )}
                <animated.div style={containerStyle} ref={node}>
                    {currentModal === 'OfferModal' ? (
                        <OfferModal tokenId={(data.data as { tokenId: TokenId })?.tokenId} />
                    ) : null}
                    {currentModal === 'LoanOrBurnModal' ? <LoanOrBurnModal /> : null}
                    {currentModal === 'LoanInputModal' ? <LoanInputModal /> : null}
                    {currentModal === 'QrCodeModal' ? <QrCodeModal /> : null}
                    {currentModal === 'SellNuggOrItemModal' ? (
                        <SellNuggOrItemModal
                            tokenId={(data.data as { tokenId: TokenId })?.tokenId}
                        />
                    ) : null}
                </animated.div>
            </div>
        </animated.div>
    );
};

export default React.memo(Modal);
