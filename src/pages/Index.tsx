import * as React from 'react';
import { Helmet } from 'react-helmet';
import Confetti from 'react-confetti';

import AppState from '../state/app';
import ProtocolState from '../state/protocol';
import Desktop from '../structure/desktop';
import Mobile from '../structure/mobile';

const IndexPage = () => {
    const type = AppState.select.screenType();
    const isOver = ProtocolState.select.epochIsOver();
    const { width, height } = AppState.select.dimensions();
    return (
        <>
            {isOver && (
                <Confetti
                    {...{ width, height }}
                    recycle={false}
                    numberOfPieces={500}
                />
            )}
            {type === 'phone' ? <Mobile /> : <Desktop />}
        </>
    );
};

export default IndexPage;
