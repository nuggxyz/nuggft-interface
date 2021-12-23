import { NLStyleSheetCreator } from '../../../lib';
import Colors from '../../../lib/colors';
import FontSize from '../../../lib/fontSize';
import Layout from '../../../lib/layout';

const styles = NLStyleSheetCreator({
    container: {
        boxShadow: `${Layout.boxShadow.prefix} ${Colors.shadows.nuggBlue}`,
        display: 'flex',
        alignItems: 'start',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'auto',
        borderRadius: Layout.borderRadius.medium,
        background: Colors.gradient2,
        padding: '.5rem',
        width: '50%',
    },
    mobile: {
        width: '90%',
    },
    bodyContainer: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '75%',
        padding: '.75rem',
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontFamily: Layout.font.inter.bold,
        fontWeight: 'bold',
        color: 'white',
    },
    button: {
        borderRadius: Layout.borderRadius.mediumish,
        background: Colors.transparentWhite,
        width: '100%',
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
        width: '100%',
    },
    leadingOfferAmount: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        width: '100%',
    },
    leadingOffer: {
        marginLeft: '.5rem',
    },
    allOffersButton: {
        borderRadius: Layout.borderRadius.large,
        background: Colors.transparentWhite,
        padding: '.44rem .45rem',
    },
});

export default styles;
