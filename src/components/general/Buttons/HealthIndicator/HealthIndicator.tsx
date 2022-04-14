import React from 'react';
import { useSpring, animated, config as springConfig } from '@react-spring/web';
import { VscSync, VscSyncIgnored } from 'react-icons/vsc';

import lib from '@src/lib';
import { useHealth } from '@src/client/hooks/useHealth';

const DisplayOk = () => {
    const rotate = useSpring({
        loop: true,
        config: springConfig.molasses,
        from: { rotateZ: 0 },
        to: { rotateZ: 180 },
    });

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                height: 30,
                background: 'white',
                borderRadius: lib.layout.borderRadius.large,
            }}
        >
            <animated.div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 30,
                    height: 30,
                    background: 'white',
                    borderRadius: lib.layout.borderRadius.large,
                    ...rotate,
                }}
            >
                <VscSync color={lib.colors.green} />
            </animated.div>
        </div>
    );
};

const DisplayProblem = () => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                height: 30,
                background: 'white',
                borderRadius: lib.layout.borderRadius.large,
            }}
        >
            <animated.div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 30,
                    height: 30,
                    background: 'white',
                    borderRadius: lib.layout.borderRadius.large,
                    // ...rotate,
                }}
            >
                <VscSyncIgnored color={lib.colors.red} />
            </animated.div>
        </div>
    );
};

export default () => {
    const { blockdiff } = useHealth();

    return blockdiff < 5 ? <DisplayOk /> : <DisplayProblem />;
};
