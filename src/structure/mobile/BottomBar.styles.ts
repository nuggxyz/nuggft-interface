import { NLStyleSheetCreator } from '../../lib';
import globalStyles from '../../lib/globalStyles';
import Layout from '../../lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        // position: 'absolute',
        ...globalStyles.backdropFilter,
        height: '100%',
    },
    buttonHover: {
        filter: 'brightness(1)',
    },
    button: {
        borderRadius: Layout.borderRadius.large,
        padding: '.5rem',
    },
});

export default styles;
