import { NLStyleSheetCreator } from '../../../../lib';
import Colors from '../../../../lib/colors';
import Layout from '../../../../lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        display: 'flex',
        alignItems: 'start',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        margin: '10px',
    },
    background: {
        background: Colors.transparentWhite,
        // backgroundSize: '400% 400%',
        // WebkitAnimation: 'AnimatedBackground 20s ease infinite',
        // animation: 'AnimatedBackground 20s ease infinite',
        padding: '10px',
        borderRadius: Layout.borderRadius.medium,
    },
    title: {
        fontFamily: Layout.font.sf.bold,
        fontWeight: 'bold',
        color: 'white',
    },
    titleRed: {
        color: Colors.gradientRed,
    },
});

export default styles;
