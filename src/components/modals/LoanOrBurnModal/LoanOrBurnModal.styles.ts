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
    },
    text: {
        color: lib.colors.grey,
        marginBottom: '.5rem',
        marginLeft: '.5rem',
        textAlign: 'center',
        fontSize: lib.fontSize.h6,
    },
    textWhite: {
        color: 'white',
    },
});

export default styles;
