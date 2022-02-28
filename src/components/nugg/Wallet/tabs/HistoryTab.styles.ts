import { NLStyleSheetCreator } from '@src/lib';
import Colors from '@src/lib/colors';
import FontSize from '@src/lib/fontSize';
import Layout from '@src/lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        display: 'flex',
        padding: '1rem',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        height: '100%',
    },
    list: {
        background: Colors.transparentLightGrey,
        borderRadius: Layout.borderRadius.mediumish,
        padding: ' .65rem ',
        flexGrow: 1,
        minHeight: '100px',
        height: '100%',
    },
    render: {
        display: 'flex',
        padding: '.5rem',
        background: 'white',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        borderRadius: Layout.borderRadius.medium,
        margin: '.25rem 0rem',
    },
    renderTitle: {
        color: Colors.nuggBlueText,
    },
    renderButton: {
        background: Colors.gradient2,
        borderRadius: Layout.borderRadius.large,
        // padding: '.4rem .7rem',
        padding: '.2rem .6rem',
    },
    renderButtonLoan: {
        background: Colors.gradient3,
        borderRadius: Layout.borderRadius.large,
    },
    textWhite: {
        color: 'white',
        fontSize: FontSize.h6,
        fontFamily: Layout.font.sf.regular,
    },
    eth: {
        background: Colors.gradient2,
        borderRadius: Layout.borderRadius.large,
        padding: '.2rem .5rem',
    },
    nuggButton: {
        borderRadius: Layout.borderRadius.large,
        padding: '.1rem .2rem',
    },
    nugg: {
        height: '45px',
        width: '45px',
    },
});

export default styles;
