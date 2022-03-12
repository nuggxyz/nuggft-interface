import React, { FunctionComponent } from 'react';
import FlipMove from 'react-flip-move';

import { sortByField } from '@src/lib';
import Layout from '@src/lib/layout';
import AppState from '@src/state/app';

import styles from './Toast.styles';
import ToastCard from './ToastCard';

type Props = Record<string, never>;

const ToastContainer: FunctionComponent<Props> = () => {
    const toasts = AppState.select.toasts();

    return (
        <div style={styles.container}>
            <FlipMove
                style={{ zIndex: 1000 }}
                enterAnimation="none"
                leaveAnimation="none"
                easing={Layout.animation}
            >
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
