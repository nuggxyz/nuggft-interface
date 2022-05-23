import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
    value: {
        ...lib.layout.presets.font.code.regular,
        // marginLeft: '.5rem',
        fontSize: lib.fontSize.h4,
    },
});

export default styles;
