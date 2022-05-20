import React from 'react';
import { useSpring, animated, config as springConfig } from '@react-spring/web';
import { IoSyncCircle } from 'react-icons/io5';

import lib from '@src/lib';
import client from '@src/client';

const DisplayOk = () => {
    const rotate = useSpring({
        loop: true,
        // delay: 3000,
        config: springConfig.molasses,
        from: { rotateZ: 0 },
        to: { rotateZ: 180 },
    });

    return (
        <animated.div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                // width: 30,
                // height: 30,
                // background: 'white',
                // borderRadius: lib.layout.borderRadius.large,
                ...rotate,
            }}
        >
            <IoSyncCircle color={lib.colors.nuggGreenSemiTransparent} size={45} />
        </animated.div>
    );
};

const DisplayProblem = () => {
    return (
        <animated.div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                // ...rotate,
            }}
        >
            <IoSyncCircle color={lib.colors.red} size={45} />
        </animated.div>
    );
};

export default () => {
    const { blockdiff } = client.health.useHealth();

    return blockdiff < 5 ? <DisplayOk /> : <DisplayProblem />;
};
