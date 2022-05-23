import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
    container: {
        display: 'flex',
        alignItems: 'start',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '100%',
        margin: '10px',
        boxShadow: `0px 1px 3px ${lib.colors.shadowNuggPink}`,
    },
    background: {
        background: lib.colors.transparentWhite,
        // backgroundSize: '400% 400%',
        // WebkitAnimation: 'AnimatedBackground 20s ease infinite',
        // animation: 'AnimatedBackground 20s ease infinite',
        padding: '10px',
        borderRadius: lib.layout.borderRadius.medium,
    },
    title: {
        ...lib.layout.presets.font.main.bold,
        // fontWeight: 'bold',
        color: 'white',
    },
    titleRed: {
        color: lib.colors.gradientRed,
    },
});

export default styles;
