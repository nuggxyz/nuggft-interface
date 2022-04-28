import lib, { NLStyleSheetCreator } from '@src/lib';

const styles = NLStyleSheetCreator({
    containerDesktop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'space-between',
        transition: `opacity .5s ${lib.layout.animation}`,
        background: 'red',
    },
    container: {
        display: 'flex',
        // flexDirection: 'column-reverse',
        justifyContent: 'space-between',
        alignItems: 'space-between',
        transition: `opacity .5s ${lib.layout.animation}`,
        width: '100%',
        background: 'red',
    },
    controlContainerDesktop: {
        background: lib.colors.transparentLightGrey,
        borderRadius: lib.layout.borderRadius.mediumish,
        width: '45%',
        position: 'relative',
        padding: '1rem',
    },
    controlContainer: {
        background: lib.colors.transparentLightGrey,
        borderRadius: lib.layout.borderRadius.mediumish,
        width: '55%',
        position: 'relative',
        padding: '1rem',
    },
    title: { width: '100%', display: 'flex', justifyContent: 'center' },
    list: {
        width: '100%',
        background: lib.colors.transparentWhite,
        height: '150px',
        padding: '0rem .4rem',
        borderRadius: lib.layout.borderRadius.medium,
    },
    buttonsContainer: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
        marginTop: '1rem',
    },
    button: {
        width: '40%',
        borderRadius: lib.layout.borderRadius.large,
    },
    loadingIndicator: {
        borderRadius: lib.layout.borderRadius.large,
        background: lib.colors.transparentWhite,
        padding: '.3rem .7rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0,
        transition: `opacity .3s ${lib.layout.animation}`,
        marginBottom: '.5rem',
    },
});

export default styles;
