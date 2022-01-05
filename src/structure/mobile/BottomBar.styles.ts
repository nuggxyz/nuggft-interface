import { NLStyleSheetCreator } from '../../lib';
import Colors from '../../lib/colors';
import globalStyles from '../../lib/globalStyles';
import Layout from '../../lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        // width: '100%',
        // position: 'absolute',
        margin: '0rem 1rem .5rem 1rem',
        ...globalStyles.backdropFilter,
        // height: '100%',
        borderRadius: Layout.borderRadius.large,
        background: Colors.transparentGrey,
    },
    buttonHover: {
        filter: 'brightness(1)',
    },
    button: {
        borderRadius: Layout.borderRadius.large,
        padding: '.5rem',
        margin: '.2rem',
    },
});

export default styles;
