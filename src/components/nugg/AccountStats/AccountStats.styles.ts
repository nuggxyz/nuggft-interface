import { NLStyleSheetCreator } from '@src/lib';
import Colors from '@src/lib/colors';
import Layout from '@src/lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        background: Colors.gradient3,
        borderRadius: Layout.borderRadius.medium,
        display: 'flex',
        boxShadow: `${Layout.boxShadow.prefix} ${Colors.shadows.nuggPink}`,
        flexDirection: 'column',
        padding: '.5rem',
        width: '50%',
    },
    subContainer: {
        width: '50%',
        whiteSpace: 'nowrap',
        display: 'flex',
        flexDirection: 'column',
        padding: '0rem .25rem',
    },
    chart: {
        background: Colors.transparentWhite,
        borderRadius: Layout.borderRadius.smallish,
        padding: 0,
    },
});

export default styles;
