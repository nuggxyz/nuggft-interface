import { NLStyleSheetCreator } from '@src/lib';
import Colors from '@src/lib/colors';
import Layout from '@src/lib/layout';

const styles = NLStyleSheetCreator({
    button: {
        background: Colors.secondaryColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Layout.borderRadius.small,
        flexDirection: 'row',
        padding: '.5rem 1rem',
        cursor: 'pointer',
        color: 'black',
        transition: 'filter .2s ease',
    },
    text: {
        margin: 0,
    },
});

export default styles;
