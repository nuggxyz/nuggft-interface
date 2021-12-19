import { NLStyleSheetCreator } from '../../lib';

const styles = NLStyleSheetCreator({
    container: {
        display: 'flex',
    },
    nuggDexContainer: {
        display: 'flex',
        width: '50%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tokenContainer: {
        display: 'flex',
        width: '50%',
        height: '100%',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default styles;
