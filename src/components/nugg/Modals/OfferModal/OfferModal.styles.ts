import { NLStyleSheetCreator } from '../../../../lib';
import Colors from '../../../../lib/colors';
import FontSize from '../../../../lib/fontSize';
import Layout from '../../../../lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        width: '100%',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
    },
    subContainer: {
        width: '100%',
    },
    input: {
        paddingTop: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        color: 'white',
    },
    button: {
        borderRadius: Layout.borderRadius.mediumish,
    },
    heading: {
        width: '50%',
        marginTop: 0,
    },
    inputCurrency: {
        textAlign: 'right',
    },
    text: {
        fontFamily: Layout.font.inter.regular,
        color: Colors.transparentWhite,
        textAlign: 'right',
        marginBottom: '1rem',
        fontSize: FontSize.h6,
    },
});

export default styles;
