import { NLStyleSheetCreator } from '@src/lib';
import Colors from '@src/lib/colors';
import FontSize from '@src/lib/fontSize';
import Layout from '@src/lib/layout';

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
        background: Colors.nuggBlueTransparent,
        color: Colors.nuggBlueText,
    },
    warning: {
        background: Colors.nuggRedTransparent,
        color: Colors.nuggRedText,
    },
    buttonDefault: {
        background: Colors.secondaryColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: Layout.borderRadius.small,
        flexDirection: 'row',
        padding: '.5rem 1rem',
        cursor: 'pointer',
        color: 'black',
        transition: 'filter .2s ease',
    },
    text: {
        margin: 0,
    },
});

export default styles;
