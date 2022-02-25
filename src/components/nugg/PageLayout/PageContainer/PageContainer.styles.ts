import Colors from '@src/lib/colors';
import Layout from '@src/lib/layout';
import { NLStyleSheetCreator } from '@src/lib/index';

const styles = NLStyleSheetCreator({
    topRight: {
        position: 'absolute',
        top: '2rem',
        right: '2rem',
        width: '100px',
        cursor: 'pointer',
        display: 'flex',
    },
    bottomLeft: {
        position: 'absolute',
        bottom: '1rem',
        left: '1rem',
        display: 'flex',
        cursor: 'pointer',
    },
    background: {
        position: 'fixed',
        pointerEvents: 'none',
        width: '200vw',
        height: '200vh',
        background: Colors.gradientRadialTransparent,
        transform: 'translate(-50vw, -100vh)',
        zIndex: -1,
    },
    toggleContainer: {
        zIndex: 10,
        position: 'absolute',
        right: 0,
        top: '50%',
        borderRadius: Layout.borderRadius.large,
        background: Colors.transparent,
        padding: '.5rem',
        marginRight: '1rem',
        marginTop: '-.5rem',
        transition: `.5s background ${Layout.animation}`,
    },
    iconColor: {
        color: Colors.nuggBlueText,
    },
    hoverColor: {
        background: Colors.nuggBlueTransparent,
        position: 'absolute',
        right: 0,
        top: '50%',
        padding: '.5rem',
        marginRight: '1rem',
        marginTop: '-.5rem',
        transition: `.5s background ${Layout.animation}`,
    },
});

export default styles;
