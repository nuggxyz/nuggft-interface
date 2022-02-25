import { NLStyleSheetCreator } from '@src/lib';

const styles = NLStyleSheetCreator({
    container: { display: 'flex', alignItems: 'center' },
    text: {
        position: 'absolute',
        cursor: 'pointer',
    },
});

export default styles;
