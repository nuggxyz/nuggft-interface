import { NLStyleSheetCreator } from '../../../../../lib';
import Colors from '../../../../../lib/colors';
import Layout from '../../../../../lib/layout';

const styles = NLStyleSheetCreator({
    nuggLinkContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '40%',
        height: '40%',
        position: 'relative',
    },
    nuggLinkPreviewContainer: {
        marginBottom: '.5rem',
        padding: '.5rem',
        background: Colors.transparentGrey,
        borderRadius: Layout.borderRadius.medium,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        alignContent: 'space-evenly',
    },
    nuggListContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    nuggListTitle: {
        position: 'absolute',
        top: '0rem',
        left: '0rem',
        padding: '.5rem',
        width: '100%',
        // background: Colors.transparentWhite,
    },
    nuggListDefault: {
        position: 'absolute',
        right: 0,
        top: 0,
        height: 0,
        width: 0,
        background: Colors.transparentGrey,
        borderRadius: Layout.borderRadius.medium,
        overflow: 'hidden',
    },
    nuggListRenderItemContainer: {
        width: '100%',
        marginTop: '1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '.5rem 1rem',
        borderRadius: Layout.borderRadius.mediumish,
        transition: `background .7s ${Layout.animation}`,
        cursor: 'pointer',
        position: 'relative',
    },
    nuggListRenderItemNugg: {
        display: 'flex',
        alignItems: 'center',
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
    hover: {
        background: Colors.nuggBlueTransparent,
    },
    selected: {
        background: Colors.nuggBlueTransparent,
    },
    nugg: {
        cursor: 'pointer',
        height: '60px',
        width: '60px',
    },
    label: {
        textAlign: 'center',
    },
    nuggLinkCategoryTitle: {
        fontFamily: Layout.font.inter.bold,
        fontWeight: 'bold',
        // color: ,
    },
});

export default styles;
