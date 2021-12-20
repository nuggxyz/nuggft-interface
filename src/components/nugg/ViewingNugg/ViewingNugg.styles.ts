import { NLStyleSheetCreator } from '../../../lib';
import Colors from '../../../lib/colors';
import Layout from '../../../lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
    },
    owner: {
        background: Colors.gradient2Transparent,
        padding: '.5rem 1rem',
        marginTop: '.5rem',
        borderRadius: Layout.borderRadius.mediumish,
        postion: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'stretch',
    },
    swaps: {
        borderRadius: Layout.borderRadius.mediumish,
        background: Colors.transparentLightGrey,
        padding: '1rem',
        marginTop: '1rem',
        maxHeight: '40%',
        width: '50%',
        overflow: 'scroll',
    },
    button: {
        padding: '.4rem .7rem',
        borderRadius: Layout.borderRadius.large,
        marginTop: '.5rem',
        background: 'white',
        margin: '.5rem .25rem',
    },
    textWhite: { color: 'white' },
});

export default styles;
