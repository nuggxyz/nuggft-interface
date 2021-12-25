import { NLStyleSheetCreator } from '../../../../lib';

const styles = NLStyleSheetCreator({
    container: {
        padding: '1rem',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    listLabel: {
        color: 'white',
        marginBottom: '.5rem',
    },
});

export default styles;
