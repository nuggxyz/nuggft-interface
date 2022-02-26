/** @format */

import Colors from '@src/lib/colors';
import { NLStyleSheetCreator } from '@src/lib';
import Layout from '@src/lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        backgroundColor: Colors.background,
        boxShadow: `${Layout.boxShadow.prefix} ${Colors.shadows.lightGrey}`,
        borderRadius: Layout.borderRadius.mediumish,
        display: 'inline-block',
        position: 'absolute',
        zIndex: 10000,
        userSelect: 'none',
        pointerEvents: 'auto',
    },
});

export default styles;
