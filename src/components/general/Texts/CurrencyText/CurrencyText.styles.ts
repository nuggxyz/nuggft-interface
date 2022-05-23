import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
    textStyle: {
        ...lib.layout.presets.font.code.regular,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default styles;
