import React, {
    FunctionComponent,
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { animated, config, useSpring } from '@react-spring/web';

import {
    isUndefinedOrNull,
    isUndefinedOrNullOrStringEmpty,
    isUndefinedOrNullOrNotString,
} from '../../../../lib';
import useOnClickOutside from '../../../../hooks/useOnClickOutside';
import usePrevious from '../../../../hooks/usePrevious';
import OfferModal from '../OfferModal/OfferModal';
import AppState from '../../../../state/app';
import StartSaleModal from '../StartSaleModal/StartSaleModal';
import useAnimateOverlay from '../../../../hooks/useAnimateOverlay';
import BurnModal from '../BurnModal/BurnModal';

import styles from './Modal.styles';

type Props = {};

const Modal: FunctionComponent<Props> = () => {
    const isOpen = AppState.select.modalIsOpen();
    const data = AppState.select.modalData();
    const isMobile = AppState.select.isSmallDevice();
    const [currentModal, setCurrentModal] = useState<NL.Redux.App.Modals>();
    const previousOpen = usePrevious(isOpen);
    const node = useRef<HTMLDivElement>();

    useEffect(() => {
        if (
            isUndefinedOrNull(isOpen) &&
            !isUndefinedOrNullOrStringEmpty(previousOpen)
        ) {
            const timeout = setTimeout(() => setCurrentModal(undefined), 500);
            return () => clearTimeout(timeout);
        } else {
            setCurrentModal(isOpen);
        }
    }, [isOpen, previousOpen]);

    const containerStyle = useSpring({
        to: {
            ...styles.container,
            ...styles.containerFull,
            transform: isOpen ? 'translate(8px, 8px)' : 'translate(36px, 36px)',
            ...data.containerStyle,
        },
        config: config.default,
    });

    const containerBackgroundStyle = useSpring({
        to: {
            ...styles.containerBackground,
            transform: isOpen
                ? 'translate(-4px, -4px)'
                : 'translate(-24px, -24px)',
            ...styles.containerFull,
            ...data.backgroundStyle,
        },
        config: config.default,
    });

    const closeModal = useCallback(
        () =>
            !isUndefinedOrNullOrNotString(isOpen) &&
            AppState.dispatch.setModalClosed(),
        [isOpen],
    );

    const style = useAnimateOverlay(!isUndefinedOrNullOrStringEmpty(isOpen));

    useOnClickOutside(node, closeModal);

    return (
        <animated.div style={style}>
            <div
                style={{
                    position: 'relative',
                }}>
                <animated.div style={containerBackgroundStyle} />
                <animated.div style={containerStyle} ref={node}>
                    {currentModal === 'Offer' ? <OfferModal /> : null}
                    {currentModal === 'StartSale' ? <StartSaleModal /> : null}
                    {currentModal === 'Burn' ? <BurnModal /> : null}
                </animated.div>
            </div>
        </animated.div>
    );
};

export default Modal;
