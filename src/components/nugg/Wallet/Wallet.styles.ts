import { NLStyleSheetCreator } from '../../../lib';

const styles = NLStyleSheetCreator({
    container: {
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        zIndex: 100,
        // position: 'fixed',
        pointerEvents: 'none',
    },
    wallet: {
        display: 'flex',
        alignItems: 'start',
        flexDirection: 'column',
        justifyContent: 'space-between',
        // width: '100%',
        height: '40%',
        // position: 'absolute',
        justifySelf: 'center',
        pointerEvents: 'auto',
    },
});

export default styles;
