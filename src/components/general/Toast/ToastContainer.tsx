import React, { FunctionComponent, useMemo } from 'react';
import FlipMove from 'react-flip-move';

import { sortByField } from '../../../lib';
import Layout from '../../../lib/layout';
import AppState from '../../../state/app';

import styles from './Toast.styles';
import ToastCard from './ToastCard';

type Props = {};

const ToastContainer: FunctionComponent<Props> = () => {
    const toasts = AppState.select.toasts();
    const screenType = AppState.select.screenType();

    return (
        <div
            style={{
                ...styles.container,
                ...(screenType === 'phone' && { paddingTop: '0rem' }),
            }}>
            <FlipMove
                enterAnimation="none"
                leaveAnimation="none"
                easing={Layout.animation}>
                {sortByField([...toasts], 'index', false).map((toast) => (
                    <div key={toast.id}>
                        <ToastCard toast={toast} />
                    </div>
                ))}
            </FlipMove>
        </div>
    );
};

export default ToastContainer;
