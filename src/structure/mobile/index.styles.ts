import { NLStyleSheetCreator } from '../../lib';
import globalStyles from '../../lib/globalStyles';

const styles = NLStyleSheetCreator({
    container: {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'background 1s ease',
    },
    account: {
        position: 'absolute',
        top: '0rem',
        width: '100%',
        zIndex: 1000,
        ...globalStyles.backdropFilter,
        padding: '.5rem',
    },
    bottomBar: {
        position: 'relative',
        zIndex: 10,
    },
    viewContainer: {
        height: '93%',
        position: 'relative',
    },
});

export default styles;
