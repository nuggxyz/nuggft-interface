import { NLStyleSheetCreator } from '@src/lib';
import Colors from '@src/lib/colors';
import globalStyles from '@src/lib/globalStyles';
import Layout from '@src/lib/layout';

const styles = NLStyleSheetCreator({
    nuggLinkContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '40%',
        height: '40%',
    },
    nuggLinkPreviewContainer: {
        background: Colors.transparentGrey,
        borderRadius: Layout.borderRadius.medium,
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    nuggLinkItemsContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        alignContent: 'space-evenly',
    },
    nuggListContainer: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    nuggListTitle: {
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        borderRadius: Layout.borderRadius.large,
        background: Colors.transparentGrey2,
        paddingRight: '.7rem',
        ...globalStyles.backdropFilter,
    },
    nuggListDefault: {
        borderRadius: Layout.borderRadius.medium,
        overflow: 'hidden',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
    },
    nuggListRenderItemContainer: {
        width: '100%',
        height: '200px',
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: `background .7s ${Layout.animation}`,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
    },
    nuggListRenderItemNugg: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    nuggLinkThumbnailContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '40%',
        width: '40%',
        borderRadius: Layout.borderRadius.mediumish,
        justifyContent: 'center',
        alignItems: 'center',
        background: Colors.transparentWhite,
        padding: '1rem',
        cursor: 'pointer',
        transition: `background .4s ${Layout.animation}`,
    },
    nuggLinkThumbnailContainerBig: {
        height: '40%',
        width: '18%',
        margin: '.5rem 2%',
    },
    hover: {
        background: Colors.nuggBlueTransparent,
    },
    selected: {
        background: Colors.nuggBlueTransparent,
    },
    nugg: {
        cursor: 'pointer',
        width: '60px',
        height: '60px',
    },
    label: {
        textAlign: 'center',
    },
    nuggLinkCategoryTitle: {
        fontFamily: Layout.font.sf.bold,
        fontWeight: 'bold',
        marginTop: '.5rem',
    },
});

export default styles;
