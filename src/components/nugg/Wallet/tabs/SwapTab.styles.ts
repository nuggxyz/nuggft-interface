import { NLStyleSheetCreator } from '@src/lib';
import Colors from '@src/lib/colors';
import globalStyles from '@src/lib/globalStyles';
import Layout from '@src/lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        padding: '1rem',
        position: 'relative',
    },
    statisticContainer: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        // position: 'relative',
        // margin: '0rem .5rem'
    },
    selectContainer: {
        borderRadius: Layout.borderRadius.large,
        background: Colors.transparentLightGrey,
        ...globalStyles.backdropFilter,
        padding: '.5rem',
    },
    lineChart: {
        borderRadius: Layout.borderRadius.medium,
        background: Colors.transparentLightGrey,
        padding: '.5rem',
        margin: '0.5rem 0rem 2.5rem 0rem',
        flexGrow: 1,
    },
    button: {
        background: 'white',
        borderRadius: Layout.borderRadius.large,
        margin: '.5rem',
    },
    whiteText: {
        color: 'white',
    },
    inputLabel: {
        color: Colors.gradientRed,
    },
    heading: {
        width: '50%',
        marginTop: 0,
    },
    style: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    input: {
        textAlign: 'right',
        color: Colors.textColor,
    },
});

export default styles;
