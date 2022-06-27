/** @format */

import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
    container: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
    },
    input: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        color: 'white',
    },
    button: {
        borderRadius: lib.layout.borderRadius.large,
        width: '100%',
        background: lib.colors.textColor,
        color: 'white',
    },
    text: {
        color: lib.colors.textColor,
        margin: '1rem .5rem .5rem 0rem',
        textAlign: 'center',
        fontSize: lib.fontSize.h6,
    },
    title: {
        color: lib.colors.textColor,
        marginBottom: '1rem',
    },
});

export default styles;
