import * as React from 'react';

import Desktop from '@src/structure/desktop';
import Mobile from '@src/structure/mobile';
import state from '@src/state';

const IndexPage = () => {
    const type = state.app.select.screenType();
    // const isOver = state.protocol.select.epochIsOver();
    // const { width, height } = state.app.select.dimensions();
    return (
        <>
            {/* {isOver && <Confetti {...{ width, height }} recycle={false} numberOfPieces={500} />} */}
            {type === 'phone' ? <Mobile /> : <Desktop />}
        </>
    );
};

export default IndexPage;
