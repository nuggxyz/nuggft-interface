import globalStyles from '@src/lib/globalStyles';
import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
    nuggLinkContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '40%',
        height: '40%',
    },
    nuggLinkPreviewContainer: {
        background: lib.colors.transparentGrey,
        borderRadius: lib.layout.borderRadius.medium,
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    nuggLinkItemsContainer: {
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
        borderRadius: lib.layout.borderRadius.large,
        background: lib.colors.semiTransparentGrey,
        paddingRight: '.7rem',
        ...globalStyles.backdropFilter,
    },
    nuggListDefault: {
        borderRadius: lib.layout.borderRadius.medium,
        overflow: 'hidden',
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
    },
    nuggListRenderItemContainer: {
        width: '100%',
        height: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: `background .7s ${lib.layout.animation}`,
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
        borderRadius: lib.layout.borderRadius.mediumish,
        justifyContent: 'center',
        alignItems: 'center',
        background: lib.colors.transparentWhite,
        padding: '1rem',
        cursor: 'pointer',
        transition: `background .4s ${lib.layout.animation}`,
    },
    nuggLinkThumbnailContainerBig: {
        height: '40%',
        width: '18%',
        margin: '.5rem 2%',
    },
    hover: {
        background: lib.colors.nuggBlueTransparent,
    },
    selected: {
        background: lib.colors.nuggBlueTransparent,
    },
    nugg: {
        cursor: 'pointer',
        width: '60px',
        height: '60px',
        padding: '.5rem',
    },
    label: {
        textAlign: 'center',
    },
    nuggLinkCategoryTitle: {
        ...lib.layout.presets.font.main.bold,
        marginTop: '.5rem',
    },
});

export default styles;
