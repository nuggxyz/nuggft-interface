/** @format */

import { NLStyleSheetCreator } from '@src/lib';
import Layout from '@src/lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        background: 'transparent',
        // padding: '0rem',
    },
    hoverOn: {
        opacity: 0.5,
        transition: `opacity .7s ${Layout.animation}`,
    },
    hoverOff: {
        opacity: 1,
        transition: `opacity .7s ${Layout.animation}`,
    },
});

export default styles;
