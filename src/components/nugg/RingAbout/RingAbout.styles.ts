import { NLStyleSheetCreator } from '@src/lib';
import Colors from '@src/lib/colors';
import FontSize from '@src/lib/fontSize';
import globalStyles from '@src/lib/globalStyles';
import Layout from '@src/lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        boxShadow: `${Layout.boxShadow.prefix} ${Colors.shadowNuggBlue}`,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
        borderRadius: Layout.borderRadius.medium,
        background: Colors.gradient2,
        padding: '.5rem',
        width: '90%',
        position: 'relative',
        height: 'auto',
        pointerEvents: 'auto',
    },
    mobile: {
        width: '90%',
        boxShadow: 'none',
        background: Colors.transparentWhite,
        ...globalStyles.backdropFilter,
        zIndex: 10000,
    },

    bodyContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        // height: '100%',
        padding: '.5rem 0rem',
        alignItems: 'center',
        justifyContent: 'center',
    },
    offersContainer: {
        background: Colors.transparentGrey,
        width: '100%',
        borderRadius: Layout.borderRadius.mediumish,
    },
    title: {
        fontFamily: Layout.font.sf.bold,
        fontWeight: 'bold',
        color: 'white',
        paddingLeft: '.25rem',
    },
    button: {
        borderRadius: Layout.borderRadius.large,
        background: 'white',
        width: '100%',
        marginTop: '.5rem',
    },
    buttonText: {
        color: Colors.nuggBlueText,
    },
    code: {
        fontFamily: Layout.font.code.regular,
        fontSize: FontSize.p,
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
    leadingOfferAmount: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        // width: '100%',
        background: Colors.transparentWhite,
        borderRadius: Layout.borderRadius.mediumish,
        padding: '.5rem .6rem',
        width: '100%',
    },
    offerAmount: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: '1.5rem',
        zIndex: 1,
        paddingLeft: '.4rem',
    },
    leadingOffer: {
        paddingRight: '0rem',
        color: Colors.nuggBlueText,
    },
    allOffersButton: {
        borderRadius: Layout.borderRadius.large,
        background: 'white',
        padding: '.44rem .45rem',
        margin: '0rem .5rem',
    },
});

export default styles;
