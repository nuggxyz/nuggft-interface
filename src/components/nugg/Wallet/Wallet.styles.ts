import { NLStyleSheetCreator } from '@src/lib';
import Colors from '@src/lib/colors';
import Layout from '@src/lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        zIndex: 100,
    },
    wallet: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%', //'430px',
        height: '80%',
        position: 'relative',
        // position: 'absolute',
        justifySelf: 'center',
        pointerEvents: 'auto',
    },
    body: {
        boxShadow: `${Layout.boxShadow.prefix} ${Colors.shadows.nuggPink}`,
        borderRadius: Layout.borderRadius.medium,
        background: Colors.gradient3,
        padding: '.75rem',
    },
    headerText: {
        color: Colors.nuggRedText,
    },
    mobileBody: {
        padding: '.5rem .4rem 0rem .4rem',
    },
    mobileHeaderText: {
        color: 'white',
    },
});

export default styles;
