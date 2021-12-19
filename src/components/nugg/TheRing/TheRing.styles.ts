import { NLStyleSheetCreator } from '../../../lib';

const styles = NLStyleSheetCreator({
    circle: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        display: 'flex',
        left: 0,
        zIndex: 100,
    },
});

export default styles;
