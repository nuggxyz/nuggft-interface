import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { animated, config, useSpring } from '@react-spring/web';

import {
    isUndefinedOrNull,
    isUndefinedOrNullOrStringEmpty,
    isUndefinedOrNullOrNotString,
} from '../../../../lib';
import useOnClickOutside from '../../../../hooks/useOnClickOutside';
import usePrevious from '../../../../hooks/usePrevious';
import OfferOrSellModal from '../OfferOrSellModal/OfferOrSellModal';
import AppState from '../../../../state/app';
import LoanOrBurnModal from '../LoanOrBurn/LoanOrBurnModal';
import useAnimateOverlay from '../../../../hooks/useAnimateOverlay';
import WalletModal from '../WalletModal/WalletModal';
import LoanInputModal from '../LoanInputModal/LoanInputModal';

import styles from './Modal.styles';

type Props = {};

const Modal: FunctionComponent<Props> = () => {
    const isOpen = AppState.select.modalIsOpen();
    const data = AppState.select.modalData();
    const [currentModal, setCurrentModal] = useState<NL.Redux.App.Modals>();
    const previousOpen = usePrevious(isOpen);
    const node = useRef<HTMLDivElement>();
    const screenType = AppState.select.screenType();

    useEffect(() => {
        if (isUndefinedOrNull(isOpen) && !isUndefinedOrNullOrStringEmpty(previousOpen)) {
            const timeout = setTimeout(() => setCurrentModal(undefined), 500);
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
            ...data.backgroundStyle,
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
                }}>
                {screenType !== 'phone' && <animated.div style={containerBackgroundStyle} />}
                <animated.div style={containerStyle} ref={node}>
                    {currentModal === 'OfferOrSell' ? <OfferOrSellModal /> : null}
                    {currentModal === 'LoanOrBurn' ? <LoanOrBurnModal /> : null}
                    {currentModal === 'Wallet' ? <WalletModal /> : null}
                    {currentModal === 'Loan' ? <LoanInputModal /> : null}
                </animated.div>
            </div>
        </animated.div>
    );
};

export default React.memo(Modal);
