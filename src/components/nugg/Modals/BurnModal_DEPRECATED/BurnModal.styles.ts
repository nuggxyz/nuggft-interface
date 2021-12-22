import { NLStyleSheetCreator } from '../../../../lib';
import Colors from '../../../../lib/colors';
import Layout from '../../../../lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        width: '630px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    textWhite: {
        color: 'white',
    },
    text: {
        color: Colors.grey,
        marginBottom: '.5rem',
        marginLeft: '.5rem',
    },
    nuggCarousel: {
        background: Colors.transparentWhite,
        overflow: 'scroll',
        borderRadius: Layout.borderRadius.mediumish,
        padding: '1rem',
        display: 'flex',
        margin: '1rem ',
        maxWidth: '100%',
    },
    nugg: {
        height: '200px',
        width: '200px',
    },
    toggle: {
        borderRadius: Layout.borderRadius.large,
        position: 'relative',
        margin: '.1rem',
        background: 'transparent',
        padding: '.4rem .5rem 1rem .5rem',
    },
    selected: { background: Colors.transparentWhite },
    button: {
        borderRadius: Layout.borderRadius.mediumish,
        width: '100%',
    },
});

export default styles;
