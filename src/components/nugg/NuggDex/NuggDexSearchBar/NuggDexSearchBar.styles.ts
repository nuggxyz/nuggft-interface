import lib, { NLStyleSheetCreator } from '@src/lib';
import Colors from '@src/lib/colors';
import globalStyles from '@src/lib/globalStyles';
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
    resultContainer: {
        position: 'absolute',
        background: lib.colors.white,
        borderRadius: lib.layout.borderRadius.mediumish,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: `${lib.layout.boxShadow.prefix} ${lib.layout.boxShadow.dark}`,
    },
    resultsList: {
        marginTop: '49px',
        height: '100%',
        width: '100%',
        overflow: 'scroll',
    },
    resultText: {
        width: '100%',
        height: '100%',
        ...globalStyles.centered,
        padding: '.5rem',
    },
    resultListItemContainer: {
        width: '100%',
        padding: '1rem 1.5rem',
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    resultListItemId: {
        background: lib.colors.nuggBlueTransparent,
        borderRadius: lib.layout.borderRadius.large,
        padding: '.2rem .6rem',
        margin: '0rem .5rem',
    },
    resultListItemToken: {
        width: '70px',
        height: '70px',
    },
    separator: {
        position: 'absolute',
        height: '1px',
        bottom: 0,
        left: 20,
        right: 20,
        background: lib.colors.transparentGrey,
    },
    gradientText: {
        color: 'black',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundImage: lib.colors.gradient3,
    },
    gradientContainer: {
        borderRadius: lib.layout.borderRadius.large,
        backgroundColor: lib.colors.white,
        padding: '.2rem .1rem .2rem .7rem',
    },
});

export default styles;
