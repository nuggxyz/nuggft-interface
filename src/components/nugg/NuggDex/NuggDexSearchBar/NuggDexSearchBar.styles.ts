import { NLStyleSheetCreator } from '../../../../lib';
import Colors from '../../../../lib/colors';
import Layout from '../../../../lib/layout';

const styles = NLStyleSheetCreator({
    searchBar: {
        zIndex: 999,
        background: Colors.nuggBlueTransparent,
        borderRadius: Layout.borderRadius.small,
        fontFamily: Layout.font.inter.regular,
        pointerEvents: 'auto',
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
