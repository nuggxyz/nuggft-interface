import React from 'react';
import { useSpring, animated, config as springConfig } from '@react-spring/web';
import { VscSyncIgnored } from 'react-icons/vsc';
import { IoSyncCircle } from 'react-icons/io5';

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
            <IoSyncCircle color={lib.colors.nuggGreenSemiTransparent} size={30} />
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
            <VscSyncIgnored color={lib.colors.red} size={30} />
        </animated.div>
    );
};

export default () => {
    const { blockdiff } = useHealth();

    return blockdiff < 5 ? <DisplayOk /> : <DisplayProblem />;
};
