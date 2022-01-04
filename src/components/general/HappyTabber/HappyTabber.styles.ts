import { NLStyleSheetCreator } from '../../../lib';
import Colors from '../../../lib/colors';
import Layout from '../../../lib/layout';

const styles = NLStyleSheetCreator({
    wrapperContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
        alignItems: 'center',
    },
    wrapperMobile: {
        flexDirection: 'column-reverse',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: Layout.borderRadius.medium,
        height: '44px',
        padding: '4px',
        width: '100%',
        flexDirection: 'row',
    },
    headerTextContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        zIndex: 5,
    },
    headerTextBold: { fontWeight: 'bold', fontFamily: Layout.font.inter.bold },
    headerText: { fontFamily: Layout.font.inter.regular },
    body: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        color: 'black',
        width: '100%',
        height: '100%',
        // textDecoration: 'none',
        position: 'relative',
        boxShadow: `${Layout.boxShadow.prefix} ${Colors.shadows.nuggPink}`,
        borderRadius: Layout.borderRadius.medium,
        background: Colors.gradient3,
        // backgroundSize: '400% 400%',
        padding: '.75rem',
    },
    item: {
        position: 'absolute',
    },
    activeButton: {
        // background: Colors.gradient,
        color: 'white',
    },
    wrapper: {
        padding: '1rem',
        width: '100%',
        height: '100%',
    },
    selectionIndicator: {
        height: '34px',
        position: 'absolute',
        zIndex: 4,
        // backgroundColor: 'rgba(80, 144, 234, 0.4)',
        background: Colors.transparentWhite,
        borderRadius: Layout.borderRadius.mediumish,
    },
});

export default styles;
