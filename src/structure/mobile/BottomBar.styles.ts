import { NLStyleSheetCreator } from '../../lib';
import Colors from '../../lib/colors';
import globalStyles from '../../lib/globalStyles';
import Layout from '../../lib/layout';

const styles = NLStyleSheetCreator({
    fixed: {
        position: 'fixed',
        width: '100%',
        bottom: 0,
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: '0rem 1rem .5rem 1rem',
        ...globalStyles.backdropFilter,
        borderRadius: Layout.borderRadius.large,
        background: Colors.transparentGrey,
        position: 'relative',
    },
    buttonHover: {
        filter: 'brightness(1)',
    },
    button: {
        borderRadius: Layout.borderRadius.large,
        padding: '.5rem',
        margin: '.2rem',
        background: 'transparent',
    },
    animatedDude: {
        height: '45px',
        background: Colors.nuggBlueTransparent,
        width: '45px',
        borderRadius: Layout.borderRadius.large,
    },
});

export default styles;
