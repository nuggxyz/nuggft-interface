import { NLStyleSheetCreator } from '@src/lib';
import Colors from '@src/lib/colors';
import Layout from '@src/lib/layout';

const styles = NLStyleSheetCreator({
    searchBar: {
        zIndex: 999,
        borderRadius: Layout.borderRadius.small,
        fontFamily: Layout.font.sf.regular,
        pointerEvents: 'auto',
        width: '100%',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
    },
    searchBarButton: {
        background: Colors.transparent,
        padding: '.5rem .3rem',
    },
    searchBarIcon: {
        color: Colors.nuggBlueText,
    },
    filterButton: {
        borderRadius: Layout.borderRadius.large,
        background: Colors.transparentWhite,
        padding: '.44rem .45rem',
        marginRight: '.3rem',
    },
});

export default styles;
