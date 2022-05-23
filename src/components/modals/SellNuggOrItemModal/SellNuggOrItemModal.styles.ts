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
    },
    heading: {
        width: '100%',
        marginTop: 0,
    },
    inputCurrency: {
        textAlign: 'left',
        width: '100%',
        background: lib.colors.transparentLightGrey,
        padding: '.3rem .6rem',
        borderRadius: lib.layout.borderRadius.mediumish,
    },
    break: {
        height: '1.5rem',
    },
    minButton: {
        borderRadius: lib.layout.borderRadius.large,
        padding: '.2rem .5rem',
    },
});

export default styles;
