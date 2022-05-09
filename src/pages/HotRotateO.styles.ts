import lib, { NLStyleSheetCreator } from '@src/lib';

const styles = NLStyleSheetCreator({
    desktopContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'space-between',
        transition: `opacity .5s ${lib.layout.animation}`,
        width: '100%',
    },
    tabletContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'space-between',
        transition: `opacity .5s ${lib.layout.animation}`,
        width: '100%',
    },
    phoneContainer: {
        display: 'flex',
        flexDirection: 'column-reverse',
        justifyContent: 'flex-end',
        alignItems: 'center',
        transition: `opacity .5s ${lib.layout.animation}`,
        width: '100%',
    },
    desktopControlContainer: {
        background: lib.colors.transparentLightGrey,
        borderRadius: lib.layout.borderRadius.mediumish,
        width: '45%',
        position: 'relative',
        padding: '1rem',
        margin: '0rem 1rem',
    },
    tabletControlContainer: {
        background: lib.colors.transparentLightGrey,
        borderRadius: lib.layout.borderRadius.mediumish,
        width: '55%',
        position: 'relative',
        padding: '1rem',
    },
    phoneControlContainer: {
        padding: '0rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '60%',
    },
    title: { width: '100%', display: 'flex', justifyContent: 'center' },
    list: {
        width: '100%',
        background: lib.colors.transparentWhite,
        // maxHeight: '400px',
        padding: '0rem .4rem',
        borderRadius: lib.layout.borderRadius.medium,
        overflow: 'scroll',
    },
    phoneList: {},
    buttonsContainer: {
        display: 'flex',
        width: '100%',
        justifyContent: 'space-around',
        marginTop: '1rem',
    },
    button: {
        minWidth: '45%',
        borderRadius: lib.layout.borderRadius.large,
        whiteSpace: 'nowrap',
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
    renderItemContainer: {
        borderRadius: lib.layout.borderRadius.medium,
        transition: '.2s background ease',
        position: 'relative',
        margin: '.6rem 1rem',
    },
    renderToken: { width: '80px', height: '80px', padding: '.3rem' },
    renderTokenMobile: { width: '50px', height: '50px', padding: '.3rem' },
    duplicateItem: { position: 'absolute', top: -5, right: -5 },
    renderItemButton: {
        borderRadius: lib.layout.borderRadius.large,
        padding: '.3rem .4rem .3rem .6rem',
        marginTop: '.3rem',
    },
    renderItemButtonMobile: {
        borderRadius: lib.layout.borderRadius.largish,
        padding: '.3rem .3rem',
        margin: '.5rem 0rem',
        width: '90%',
    },
    phoneToken: { height: 200, width: 200 },
    tabletToken: { height: 400, width: 400 },
    desktopToken: { height: 600, width: 600 },
    phoneTokenContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    tabletTokenContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    desktopTokenContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    horizontalListContainer: {
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        height: '200px',
    },
    verticalListContainer: {
        display: 'flex',
        width: '40%',
        flexDirection: 'column',
        maxHeight: '100%',
        alignItems: 'center',
        position: 'relative',
        // background: 'red',
        // margin: '0rem 1rem',
    },
});

export default styles;
