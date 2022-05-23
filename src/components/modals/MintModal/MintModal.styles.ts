import lib from '@src/lib';
import globalStyles from '@src/lib/globalStyles';

const styles = lib.layout.NLStyleSheetCreator({
    container: {
        width: '100%',
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
    },
    top: {
        ...globalStyles.centered,
        height: '100px',
    },
    text: {
        color: lib.colors.white,
    },
    button: {
        borderRadius: lib.layout.borderRadius.large,
        width: '100%',
    },
});

export default styles;
