import { NLStyleSheetCreator } from '../../../lib';
import Colors from '../../../lib/colors';
import FontSize from '../../../lib/fontSize';
import Layout from '../../../lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        boxShadow: `${Layout.boxShadow.prefix} ${Colors.shadows.nuggBlue}`,
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
    },
    bodyContainer: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        // height: '100%',
        padding: '.75rem',
        alignItems: 'center',
        justifyContent: 'center',
    },
    offersContainer: {
        background: Colors.transparentGrey,
        width: '100%',
        borderRadius: Layout.borderRadius.mediumish,
    },
    title: {
        fontFamily: Layout.font.inter.bold,
        fontWeight: 'bold',
        color: 'white',
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
        width: '100%',
        flexDirection: 'column',
    },
    leadingOfferContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: '.5rem',
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
    },
    offerAmount: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: '1.5rem',
        zIndex: 1,
    },
    leadingOffer: {
        paddingRight: '0rem',
        color: Colors.nuggBlueText,
    },
    allOffersButton: {
        borderRadius: Layout.borderRadius.large,
        background: 'white',
        padding: '.44rem .45rem',
    },
});

export default styles;
