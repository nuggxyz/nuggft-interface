import { NLStyleSheetCreator } from '../../../lib';

const styles = NLStyleSheetCreator({
    container: {
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        zIndex: 100,
    },
    wallet: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%', //'430px',
        height: '80%',
        position: 'relative',
        // position: 'absolute',
        justifySelf: 'center',
        pointerEvents: 'auto',
    },
});

export default styles;
