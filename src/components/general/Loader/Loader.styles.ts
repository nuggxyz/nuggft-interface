import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
    loader: {
        borderRadius: '100%',
        borderBottom: `2px solid ${lib.colors.blue}`,
        borderRight: `2px solid ${lib.colors.blue}`,
        borderLeft: `2px solid ${lib.colors.blue}`,
        borderTop: '2px solid transparent',
        height: '1rem',
        width: '1rem',
        transform: 'rotate(0turn)',
        transition: `transform .5s ${lib.layout.animation}`,
    },
});

export default styles;
