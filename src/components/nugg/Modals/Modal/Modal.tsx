import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';
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
import MintModal from '@src/components/nugg/Modals/MintModal/MintModal';

import styles from './Modal.styles';

type Props = Record<string, never>;

const Modal: FunctionComponent<Props> = () => {
    const isOpen = AppState.select.modalIsOpen();
    const data = AppState.select.modalData();
    const [currentModal, setCurrentModal] = useState<ModalNames>();
    const previousOpen = usePrevious(isOpen);
    const node = useRef<HTMLDivElement>(null);
    const screenType = AppState.select.screenType();
    const [stableData, setStableData] = useState(data);

    useLayoutEffect(() => {
        if (data && (data.data || data.targetId)) setStableData(data);
    }, [data]);

    useEffect(() => {
        if (isUndefinedOrNull(isOpen) && !isUndefinedOrNullOrStringEmpty(previousOpen)) {
            const timeout = setTimeout(() => setCurrentModal(undefined), 1000);
            return () => clearTimeout(timeout);
        }
        setCurrentModal(isOpen);
        return () => undefined;
    }, [isOpen, previousOpen]);

    const containerStyle = useSpring({
        to: {
            ...styles.container,
            ...(screenType === 'phone' ? styles.containerMobile : styles.containerFull),
            // eslint-disable-next-line no-nested-ternary
            transform: isOpen
                ? screenType === 'phone'
                    ? 'translate(0px, 18px)'
                    : 'translate(8px, 8px)'
                : 'translate(36px, 36px)',
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

    const style: CSSPropertiesAnimated = useAnimateOverlay(!!isOpen);

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
                        style={{ ...containerBackgroundStyle, ...stableData.backgroundStyle }}
                    />
                )}
                <animated.div
                    style={{ ...containerStyle, ...stableData.containerStyle }}
                    ref={node}
                >
                    {currentModal === 'OfferModal' ? (
                        <OfferModal tokenId={(stableData.data as { tokenId: TokenId })?.tokenId} />
                    ) : null}
                    {currentModal === 'LoanOrBurnModal' ? <LoanOrBurnModal /> : null}
                    {currentModal === 'LoanInputModal' ? <LoanInputModal /> : null}
                    {currentModal === 'QrCodeModal' ? <QrCodeModal /> : null}
                    {currentModal === 'MintModal' ? <MintModal /> : null}
                    {currentModal === 'SellNuggOrItemModal' ? (
                        <SellNuggOrItemModal
                            tokenId={(stableData.data as { tokenId: TokenId })?.tokenId}
                        />
                    ) : null}
                </animated.div>
            </div>
        </animated.div>
    );
};

export default React.memo(Modal);
