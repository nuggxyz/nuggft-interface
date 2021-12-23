import { NLStyleSheetCreator } from '../../lib';

const styles = NLStyleSheetCreator({
    container: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        background: 'white',
    },
    buttonHover: {
        filter: 'brightness(1)',
    },
});

export default styles;
