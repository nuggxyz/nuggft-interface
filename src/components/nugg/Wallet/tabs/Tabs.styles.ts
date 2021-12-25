import { NLStyleSheetCreator } from '../../../../lib';
import Layout from '../../../../lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        padding: '1rem',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    listLabel: {
        color: 'white',
        marginBottom: '.5rem',
    },
    listNugg: {
        height: '80px',
        width: '80px',
    },
    listNuggButton: {
        display: 'flex',
        padding: '.5rem 1rem',
        background: 'white',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        borderRadius: Layout.borderRadius.medium,
        margin: '.25rem 0rem',
    },
});

export default styles;
