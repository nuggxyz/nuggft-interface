import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
    barContainer: {
        width: '100%',
        height: '5px',
        position: 'absolute',
        bottom: 0,
    },
    timer: {
        width: '100%',
        height: '100%',
        background: lib.colors.primaryColor,
        transition: `width .1s ease`,
    },
});

export default styles;
