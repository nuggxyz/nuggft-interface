import { NLStyleSheetCreator } from '@src/lib';
import Colors from '@src/lib/colors';
import FontSize from '@src/lib/fontSize';
import Layout from '@src/lib/layout';

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
    inputContainer: {
        display: 'flex',
        width: '100%',
        alignItems: 'flex-end',
        padding: '.5rem',
    },
    input: {
        paddingTop: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        color: 'white',
    },
    button: {
        borderRadius: Layout.borderRadius.large,
    },
    heading: {
        width: '100%',
        marginTop: 0,
    },
    inputCurrency: {
        textAlign: 'left',
        width: '100%',
        background: Colors.transparentLightGrey,
        padding: '.3rem .6rem',
        borderRadius: Layout.borderRadius.mediumish,
    },
    text: {
        fontFamily: Layout.font.sf.regular,
        color: Colors.transparentWhite,
        textAlign: 'center',
        fontSize: FontSize.h6,
    },
});

export default styles;
