import { NLStyleSheetCreator } from '../../lib';

const styles = NLStyleSheetCreator({
    container: {
        height: '100%',
        width: '100%',
        overflow: 'hiiden',
        display: 'flex',
        flexDirection: 'column',
    },
    bottomBar: {
        height: '10%',
    },
    viewContainer: {
        height: '90%',
    },
});

export default styles;
