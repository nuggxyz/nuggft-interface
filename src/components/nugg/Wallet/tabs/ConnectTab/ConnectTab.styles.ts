import lib, { NLStyleSheetCreator } from '@src/lib';

const styles = NLStyleSheetCreator({
    container: {
        padding: '.25rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        height: '100%',
    },
    disclaimerContainer: {
        background: lib.colors.transparentLightGrey,
        borderRadius: lib.layout.borderRadius.smallish,
        margin: '1.5rem',
        padding: '1rem',
    },
    titleContainer: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
    },
    walletsContainer: {
        background: lib.colors.transparentWhite,
        borderRadius: lib.layout.borderRadius.medium,
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        alignItems: 'center',
        width: '100%',
        overflow: 'scroll',
    },
    walletButton: {
        borderRadius: lib.layout.borderRadius.large,
        padding: '.5rem',
        pointerEvents: 'auto',
        background: `white`,
        margin: '.5rem',
        width: '225px',
        boxShadow: lib.layout.boxShadow.dark,
        color: 'white',
    },
});

export default styles;
