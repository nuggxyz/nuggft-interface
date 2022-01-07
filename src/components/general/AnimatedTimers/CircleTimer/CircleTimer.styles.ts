import { NLStyleSheetCreator } from '../../../../lib';

const styles = NLStyleSheetCreator({
    container: {
        zIndex: 1,
    },
    childrenContainer: {
        position: 'absolute',
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
    },
    svgTransition: {
        transition: 'filter .5s ease',
        transformBox: 'fill-box',
        transformOrigin: 'center',
        transform: 'rotate(-90deg)',
    },
    circle: {},
});

export default styles;
