import React, { FunctionComponent, useMemo } from 'react';
import FlipMove from 'react-flip-move';

import { sortByField } from '../../../lib';
import Layout from '../../../lib/layout';
import AppState from '../../../state/app';

import styles from './Toast.styles';
import ToastCard from './ToastCard';

type Props = {};

const ToastContainer: FunctionComponent<Props> = () => {
    const { height, width } = AppState.select.dimensions();

    const toasts = AppState.select.toasts();

    const containerStyle = useMemo(() => {
        return {
            ...styles.container,
            height,
            width,
        };
    }, [height, width]);

    return (
        <div style={containerStyle}>
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
