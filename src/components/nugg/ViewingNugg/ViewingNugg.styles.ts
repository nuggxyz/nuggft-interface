import lib, { NLStyleSheetCreator } from '@src/lib';
import Colors from '@src/lib/colors';
import globalStyles from '@src/lib/globalStyles';
import Layout from '@src/lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '85%',
        width: '80%',
        position: 'relative',
    },
    nuggId: {
        color: lib.colors.nuggBlueText,
        padding: '.5rem .8rem',
        background: Colors.transparentWhite,
        borderRadius: Layout.borderRadius.small,
        whiteSpace: 'nowrap',
    },
    nuggContainer: {
        position: 'relative',
        height: '400px',
        width: '100%', // '400px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    nuggContainerMobile: {
        position: 'relative',
        height: '400px',
        width: '100%',
        top: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        zIndex: 100,
    },
    titleText: {
        color: Colors.white,
        display: 'flex',
        alignItems: 'center',
    },
    owner: {
        background: Colors.nuggBlueTransparent,
        padding: '.5rem',
        borderRadius: Layout.borderRadius.mediumish,
        postion: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'stretch',
        borderBottomRightRadius: 0,
        borderBottomLeftRadius: 0,
        position: 'relative',
        width: '100%',
    },
    swapsWrapper: {
        // height: '40%',
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    swaps: {
        borderRadius: Layout.borderRadius.mediumish,
        background: Colors.transparentGrey,
        // marginTop: '1rem',
        width: '100%',
        position: 'relative',
        // justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    swapsMobile: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRadius: Layout.borderRadius.mediumish,
        // overflow: 'hidden',
        background: Colors.transparentGrey,
        width: '95%',
    },
    swapItemContainer: {
        padding: '.25rem 1rem',
        margin: '.25rem 0rem',
        flexDirection: 'column',
        ...globalStyles.centered,
    },
    swap: {
        background: Colors.gradient2Transparent,
        padding: '.5rem 1rem',
        borderRadius: Layout.borderRadius.mediumish,
        postion: 'relative',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    button: {
        padding: '.75rem 1rem',
        margin: '.5rem',
        borderRadius: lib.layout.borderRadius.large,
        background: 'white',
        width: '40%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textBlack: { color: Colors.primaryColor },
    textBlue: { color: lib.colors.nuggBlueText },
    flyout: {
        position: 'absolute',
        zIndex: 10,
        top: '.7rem',
        left: '.7rem',
    },
    flyoutButton: {
        background: Colors.white,
        borderRadius: Layout.borderRadius.large,
        padding: '.4rem .4rem 0rem .4rem',
    },
    ownerButtonContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        // height: '100%',
        width: '100%',
        overflow: 'hidden',
        background: lib.colors.transparentGrey2,
        margin: '.4rem',
        borderRadius: lib.layout.borderRadius.smallish,
    },
    stickyListRight: {
        width: '100%',
        overflow: 'scroll',
    },
    stickyList: {
        // height: '100%',
        width: '100%',
        overflow: 'hidden',
        // margin: '.4rem',
    },
    tabberList: {
        // background: lib.colors.nuggBlueTransparent,
        // borderRadius: lib.layout.borderRadius.smallish,
    },
    swapButton: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        display: 'flex',
    },
    listTitle: {
        padding: '.5rem',
        background: Colors.transparentWhite,
        width: '100%',
        ...globalStyles.backdropFilter,
    },
    listItemSvg: {
        height: '100px',
        width: '100px',
        // background: 'red',
    },
    itemListItem: {
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        width: '100%',
        marginBottom: '.5em',
        background: lib.colors.transparentWhite,
        borderRadius: lib.layout.borderRadius.mediumish,
    },
    itemListButton: {
        borderRadius: Layout.borderRadius.large,
        background: Colors.gradient2Transparent,
        position: 'absolute',
        right: '1rem',
    },
    itemListButtonText: {
        color: Colors.white,
        marginLeft: '.5rem',
    },
    zoom: {
        borderRadius: lib.layout.borderRadius.large,
        padding: '.3rem .5rem',
        position: 'absolute',
        right: '.5rem',
    },
    goToSwap: {
        marginBottom: '.4rem',
        borderRadius: lib.layout.borderRadius.large,
        backgroundColor: lib.colors.white,
        padding: '.2rem .7rem',
    },
    goToSwapGradient: {
        background: lib.colors.gradient3,
        color: 'black',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
});

export default styles;
