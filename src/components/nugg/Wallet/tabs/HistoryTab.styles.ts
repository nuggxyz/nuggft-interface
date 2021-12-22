import { NLStyleSheetCreator } from '../../../../lib';
import Colors from '../../../../lib/colors';
import Layout from '../../../../lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        display: 'flex',
        padding: '1rem',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        height: '100%',
    },
    list: {
        background: Colors.transparentLightGrey,
        borderRadius: Layout.borderRadius.mediumish,
        padding: ' .75rem 1rem',
        margin: '0rem 0rem 1rem 0rem',
        flexGrow: 1,
        minHeight: '100px',
        height: 'auto',
    },
    render: {
        display: 'flex',
        padding: '.5rem .5rem .5rem 1rem',
        background: 'white',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        borderRadius: Layout.borderRadius.medium,
        margin: '.25rem 0rem',
    },
    renderTitle: {
        color: Colors.nuggBlueText,
    },
    renderButton: {
        background: Colors.gradient2,
        borderRadius: Layout.borderRadius.smallish,
    },
    textWhite: {
        color: ' white',
    },
    eth: {
        background: Colors.gradient2,
        borderRadius: Layout.borderRadius.large,
        padding: '.2rem .5rem',
    },
    nuggButton: {
        borderRadius: Layout.borderRadius.large,
        padding: '.1rem .2rem',
    },
    nugg: {
        height: '45px',
        width: '45px',
    },
});

export default styles;
