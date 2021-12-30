import { NLStyleSheetCreator } from '../../../lib';
import Colors from '../../../lib/colors';
import Layout from '../../../lib/layout';

const styles = NLStyleSheetCreator({
    wrapper: {
        height: '90%',
        borderRadius: Layout.borderRadius.medium,
        position: 'absolute',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        height: '100%',
    },
    owner: {
        background: Colors.transparentWhite,
        padding: '.5rem',
        borderRadius: Layout.borderRadius.mediumish,
        postion: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'stretch',
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
    },
    swaps: {
        borderRadius: Layout.borderRadius.mediumish,
        background: Colors.transparentGrey,
        // padding: '1rem',
        marginTop: '1rem',
        // height: '60%',
        width: '100%',
    },
    swap: {
        background: Colors.gradient2Transparent,
        padding: '.5rem 1rem',
        marginTop: '.5rem',
        borderRadius: Layout.borderRadius.mediumish,
        postion: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'stretch',
    },
    button: {
        padding: '.4rem .7rem',
        borderRadius: 0,
        // marginTop: '.5rem',
        background: 'white',
        // margin: '.2rem',
    },
    textWhite: { color: 'white' },
});

export default styles;
