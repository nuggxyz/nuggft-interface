import * as React from 'react';
import Confetti from 'react-confetti';

import AppState from '@src/state/app';
import ProtocolState from '@src/state/protocol';
import Desktop from '@src/structure/desktop';
import Mobile from '@src/structure/mobile';

const IndexPage = () => {
    const type = AppState.select.screenType();
    const isOver = ProtocolState.select.epochIsOver();
    const { width, height } = AppState.select.dimensions();
    return (
        <>
            {isOver && <Confetti {...{ width, height }} recycle={false} numberOfPieces={500} />}
            {type === 'phone' ? <Mobile /> : <Desktop />}
        </>
    );
};

export default IndexPage;
