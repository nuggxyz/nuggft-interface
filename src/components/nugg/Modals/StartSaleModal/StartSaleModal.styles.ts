/** @format */

import { NLStyleSheetCreator } from '../../../../lib';
import Colors from '../../../../lib/colors';
import Layout from '../../../../lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    },
    input: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        color: 'white',
    },
    button: {
        borderRadius: Layout.borderRadius.mediumish,
        width: '100%',
    },
    text: {
        color: Colors.grey,
        marginBottom: '.5rem',
        marginLeft: '.5rem',
    },
    textWhite: {
        color: 'white',
    },
});

export default styles;
