import { NLStyleSheetCreator } from '../../../../lib';
import Colors from '../../../../lib/colors';
import globalStyles from '../../../../lib/globalStyles';
import Layout from '../../../../lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        display: 'flex',
        width: '100%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        padding: '1rem',
    },
    statisticContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    selectContainer: {
        borderRadius: Layout.borderRadius.medium,
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
        background: Colors.gradient3,
        borderRadius: Layout.borderRadius.mediumish,
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
