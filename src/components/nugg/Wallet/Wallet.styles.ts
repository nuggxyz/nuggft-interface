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
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '90%', //'430px',
        height: '70%',
        position: 'relative',
        // position: 'absolute',
        justifySelf: 'center',
        pointerEvents: 'auto',
    },
});

export default styles;
