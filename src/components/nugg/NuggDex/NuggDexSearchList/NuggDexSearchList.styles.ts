import { NLStyleSheetCreator } from '../../../../lib';

const styles = NLStyleSheetCreator({
    searchListContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '80%',
        flexWrap: 'wrap',
        height: '80%',
        position: 'relative',
    },
    nuggLinksContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        flexWrap: 'wrap',
        height: '100%',
        position: 'relative',
    },
    nuggListEnter: {
        left: '0px',
        top: '0px',
        width: '100%',
        height: '100%',
        opacity: 1,
    },
});

export default styles;
