import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
    container: {
        width: '100%',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
    },
    subContainer: {
        width: '100%',
    },
    inputContainer: {
        display: 'flex',
        width: '100%',
        alignItems: 'flex-end',
        padding: '.5rem',
        flexDirection: 'column',
    },
    input: {
        paddingTop: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        color: 'white',
    },
    button: {
        borderRadius: lib.layout.borderRadius.large,
        background: lib.colors.textColor,
        color: 'white',
    },
    heading: {
        width: '100%',
        marginTop: 0,
        color: lib.colors.textColor,
    },
    inputCurrency: {
        textAlign: 'left',
        width: '100%',
        background: lib.colors.transparentDarkGrey2,
        padding: '.8rem .6rem',
        borderRadius: lib.layout.borderRadius.mediumish,
    },
    text: {
        // color: lib.colors.textColor,
        // textAlign: 'center',
        // flexDirection: 'row',
        // display: 'flex',
        // justifyContent: 'center',
        // alignItems: 'center',
        color: lib.colors.textColor,
        textAlign: 'center',
        fontSize: lib.fontSize.h6,
    },
});

export default styles;
