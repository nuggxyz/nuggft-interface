/** @format */

import { NLStyleSheetCreator } from '../../../../lib';
import Colors from '../../../../lib/colors';
import FontSize from '../../../../lib/fontSize';
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
        borderRadius: Layout.borderRadius.large,
        width: '100%',
    },
    text: {
        color: Colors.grey,
        marginBottom: '.5rem',
        marginLeft: '.5rem',
        textAlign: 'center',
        fontSize: FontSize.h6,
    },
    textWhite: {
        color: 'white',
    },
});

export default styles;
