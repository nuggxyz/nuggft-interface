import lib from '@src/lib';

export default lib.layout.NLStyleSheetCreator({
    container: {
        cursor: 'pointer',
    },
    text: {
        transition: `.5s ${lib.layout.animation} color`,
    },
    selected: {
        color: lib.colors.tintColor,
    },
    innerContainer: {
        display: 'flex',
        alignItems: 'center',
    },
    border: {
        width: '0%',
        height: '1px',
        marginTop: '.1rem',
        marginBottom: '.2rem',
        background: 'white',
        transition: `.5s ${lib.layout.animation} width, .5s ${lib.layout.animation} background`,
    },
    borderSelected: {
        width: '100%',
        background: lib.colors.tintColor,
    },
    badgeStyle: {
        height: '2rem',
        width: '2rem',
        borderRadius: '50%',
        background: lib.colors.darkerGray,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex',
        marginLeft: '3rem',
        fontWeight: 'bold',
        transition: `.5s ${lib.layout.animation} background`,
    },
    badgeSelected: {
        background: lib.colors.tintColor,
    },
});
