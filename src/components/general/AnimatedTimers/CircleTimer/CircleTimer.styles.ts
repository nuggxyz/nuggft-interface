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
        // transformBox: 'fill-box',
    },
    circle: {
        transformOrigin: 'center',
        transform: 'rotate(-90deg)',
    },
});

export default styles;
