import { NLStyleSheetCreator } from '../../../lib';
import Colors from '../../../lib/colors';

const styles = NLStyleSheetCreator({
    container: {
        height: '90%',
    },
    rowContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        border: `1px solid ${Colors.darkerGray}`,
    },
    headerItem: {
        margin: '.5rem 0rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        textOverflow: 'ellipses',
        overflow: 'hidden',
    },
    rowItem: {
        padding: '.5rem .5rem',
        display: 'flex',
        alignItems: 'center',
        textOverflow: 'ellipses',
        overflow: 'hidden',
    },
    numberRowItem: {
        justifyContent: 'center',
    },
});

export default styles;
