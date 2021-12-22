import { NLStyleSheetCreator } from '../../../../lib';
import Colors from '../../../../lib/colors';
import FontSize from '../../../../lib/fontSize';
import Layout from '../../../../lib/layout';

const styles = NLStyleSheetCreator({
    button: {
        borderRadius: Layout.borderRadius.large,
        fontSize: FontSize.p,
        transition: `all 0.5s ease`,
        flexWrap: 'nowrap',
        flexGrow: 2,
        dipaly: 'flex',
        alignItems: 'center',
        padding: '.1rem 1rem .1rem .5rem',
    },
    normal: {
        background: Colors.gradient2Transparent,
        color: 'white', //Colors.nuggBlueText,
    },
    warning: {
        background: Colors.nuggRedTransparent,
        color: Colors.nuggRedText,
    },
});

export default styles;
