import { NLStyleSheetCreator } from '../../../../lib';
import Colors from '../../../../lib/colors';
import globalStyles from '../../../../lib/globalStyles';
import Layout from '../../../../lib/layout';

const styles = NLStyleSheetCreator({
    navBarContainer: {
        display: 'flex',
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: 998,
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: `all 0.3s ${Layout.animation}`,
        padding: '1rem 0rem',
        height: Layout.header.height,
    },
    navBarBackground: {
        ...globalStyles.absoluteFill,
        background: 'transparent',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        transition: `all 0.6s ${Layout.animation}`,
    },
    navBarHover: {
        background: Colors.nuggBlueTransparent,
        cursor: 'pointer',
    },
    searchBarContainer: {
        padding: '0rem 1rem',
        position: 'relative',
        display: 'flex',
        width: '50%',
        justifyContent: 'flex-start',
        pointerEvents: 'none',
    },
    linkAccountContainer: {
        padding: '0rem 1rem',
        position: 'relative',
        display: 'flex',
        width: '50%',
        justifyContent: 'space-between',
        alignItems: 'center',
        pointerEvents: 'none',
    },
});

export default styles;
