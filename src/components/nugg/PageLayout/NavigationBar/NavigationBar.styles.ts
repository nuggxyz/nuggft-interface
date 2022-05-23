import globalStyles from '@src/lib/globalStyles';
import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
    navBarContainer: {
        display: 'flex',
        position: 'absolute',
        top: 0,
        width: '100%',
        zIndex: 1000,
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: `all 0.3s ${lib.layout.animation}`,
        padding: '1rem 0rem',
        height: lib.layout.header.height,
    },
    navBarBackground: {
        ...globalStyles.absoluteFill,
        // background: 'transparent',
        // backdropFilter: 'blur(20px)',
        // WebkitBackdropFilter: 'blur(20px)',
        // transition: `all 0.6s ${lib.layout.animation}`,
    },
    navBarHover: {
        background: lib.colors.nuggBlueTransparent,
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
        alignItems: 'center',
        // pointerEvents: 'none',
    },
} as const);

export default styles;
