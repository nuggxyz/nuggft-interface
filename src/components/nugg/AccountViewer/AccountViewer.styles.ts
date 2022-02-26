import { NLStyleSheetCreator } from '@src/lib';
import Colors from '@src/lib/colors';
import Layout from '@src/lib/layout';

const styles = NLStyleSheetCreator({
    button: {
        color: Colors.textColor,
        // background: Colors.nuggBlueTransparent,
        // position: 'absolute',
        // right: '1rem',
        borderRadius: Layout.borderRadius.large,
        // padding: '.6rem 1rem',
        pointerEvents: 'auto',
    },
    textContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    amount: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.gradient,
        borderRadius: '12px',
        whiteSpace: 'nowrap',
        width: '100%',
    },
    text: {
        fontFamily: Layout.font.sf.regular,
        color: Colors.nuggBlueText,
        fontWeight: 'lighter',
    },
    iconWrapper: {
        display: 'flex',
        height: '100%',
        width: '20px',
        marginLeft: '.5rem',
        alignItems: 'center',
        flexFlow: 'column nowrap',
    },
    statusConnected: {
        backgroundColor: Colors.transparentWhite,
        border: '3px solid ' + Colors.nuggBlueText,
        color: Colors.nuggBlueText,
        fontWeight: 'normal',
    },
    statusConnect: {
        backgroundColor: Colors.nuggBlueTransparent,
        border: 'none',
        color: Colors.secondaryColor,
        fontWeight: 'normal',
        display: 'flex',
        padding: '0rem 1rem',
    },
    statusError: {
        backgroundColor: Colors.red,
        border: '1px solid ' + Colors.red,
        color: 'white',
        fontWeight: 'normal',
        display: 'flex',
    },
    main: {
        zIndex: 999,
        userSelect: 'none',
        padding: '.5rem',
        borderRadius: Layout.borderRadius.medium,
        justifyContent: 'space-between',
        alignItems: 'center',
        fontWeight: 'normal',
        display: 'flex',
        cursor: 'pointer',
    },
    networkIcon: {
        marginLeft: '0.25rem',
        marginRight: '0.5rem',
        width: '16px',
        height: '16px',
    },
});

export default styles;
