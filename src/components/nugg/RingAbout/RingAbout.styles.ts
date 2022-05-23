import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
    container: {
        boxShadow: `${lib.layout.boxShadow.prefix} ${lib.colors.shadowNuggBlue}`,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        borderRadius: lib.layout.borderRadius.medium,
        background: lib.colors.gradient2,
        padding: '.75rem',
        width: '100%',
        position: 'relative',
        height: 'auto',
        pointerEvents: 'auto',
    },
    containerDark: {
        boxShadow: `${lib.layout.boxShadow.prefix} ${lib.colors.shadowNuggBlue}`,
        borderRadius: lib.layout.borderRadius.medium,
        background: lib.colors.transparentGrey,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',

        padding: '.75rem',
        width: '100%',
        position: 'relative',
        height: 'auto',
        pointerEvents: 'auto',
    },
    containerTablet: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        borderRadius: lib.layout.borderRadius.medium,
        width: '100%',
        position: 'relative',
        height: 'auto',
        pointerEvents: 'auto',
    },
    mobile: {
        // width: '90%',
        // // boxShadow: 'none',
        // // background: lib.colors.transparentWhite,
        // ...globalStyles.backdropFilter,
        // zIndex: 10000,
    },
    bodyContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    offersContainer: {
        background: lib.colors.transparentGrey,
        width: '100%',
        borderRadius: lib.layout.borderRadius.mediumish,
    },
    title: {
        ...lib.layout.presets.font.main.bold,
        fontWeight: 'bold',
        color: 'white',
        paddingLeft: '.5rem',
        paddingBottom: '.25rem',
        textAlign: 'center',
    },
    button: {
        borderRadius: lib.layout.borderRadius.large,
        background: 'white',
        width: '100%',
        marginTop: '.5rem',
        zIndex: 500,
    },
    buttonText: {
        color: lib.colors.nuggBlueText,
    },
    code: {
        ...lib.layout.presets.font.code.regular,
        fontSize: lib.fontSize.p,
        textAlign: 'right',
        marginTop: '.2rem',
    },
    leaderContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
    },
    leaderContainerMobile: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        display: 'flex',
        alignItems: 'center',
    },
    leadingOfferContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: '.5rem',
        zIndex: 2,
    },
    leadingOfferContainerMobile: {
        display: 'flex',
        flexDirection: 'row-reverse',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 2,
    },
    leadingOfferAmountContainer: {
        display: 'flex',
        width: '100%',
        background: 'transparent',
        padding: '0rem',
        marginTop: 20,
        position: 'relative',
    },
    leadingOfferAmount: {
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        background: lib.colors.transparentWhite,
        borderRadius: lib.layout.borderRadius.mediumish,
        padding: '.4rem',
        width: '100%',
        marginBottom: '.4rem',
    },
    leadingOfferAmountBlock: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        background: lib.colors.transparentWhite,
        borderRadius: lib.layout.borderRadius.smallish,
        padding: '.5rem .6rem',
        marginRight: '.5rem',
    },
    leadingOfferAmountUser: {
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100%',
    },
    offerAmount: {
        position: 'relative',
        padding: '.4rem',
        borderRadius: lib.layout.borderRadius.smallish,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginBottom: '.75rem',
        zIndex: 1,
        paddingLeft: '.4rem',
        background: lib.colors.transparentLightGrey,
    },
    leadingOffer: {
        paddingRight: '0rem',
        color: lib.colors.nuggBlueText,
    },
    allOffersButton: {
        borderRadius: lib.layout.borderRadius.large,
        background: 'white',
        padding: '.24rem .25rem',
        margin: '0rem .5rem',
        display: 'flex',
    },
    ownerBlockContainer: {
        width: '100%',
        // background: lib.colors.transparentWhite,
        // borderRadius: lib.layout.borderRadius.medium,
        padding: '.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '.1rem',
        marginBottom: '.5rem',
        // boxShadow: `0px 1px 3px ${lib.colors.shadowNuggBlue}`,
        textAlign: 'center',
    },
    textBlue: {
        color: lib.colors.nuggBlueText,
    },
    showMoreButton: {
        background: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0rem',
        margin: '.4rem 0rem',
        width: '100%',
        textAlign: 'center',
    },
    etherscanBtn: {
        position: 'absolute',
        right: '.5rem',
        borderRadius: lib.layout.borderRadius.large,
        background: lib.colors.white,
        padding: '.3rem',
    },
});

export default styles;
