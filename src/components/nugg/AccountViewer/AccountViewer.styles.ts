import lib, { NLStyleSheetCreator } from '@src/lib';
import Colors from '@src/lib/colors';
import Layout from '@src/lib/layout';

const styles = NLStyleSheetCreator({
    balance: {
        color: Colors.textColor,
        borderRadius: Layout.borderRadius.large,
        pointerEvents: 'auto',
    },
    textContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    text: {
        color: lib.colors.nuggBlueText,
        marginRight: '.3rem',
    },
    flyout: {
        right: '1rem',
        top: '1.5rem',
    },
    flyoutButton: {
        padding: '.75rem 1rem .75rem 1rem',
        borderRadius: 0,
        background: 'white',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'start',
    },
});

export default styles;
