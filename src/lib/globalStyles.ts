import { NLStyleSheetCreator } from './index';

const globalStyles = NLStyleSheetCreator({
    absoluteFill: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    fillWidth: {
        width: '100%',
    },
    fillHeight: {
        height: '100%',
    },
    centered: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    centeredSpaceBetween: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    backdropFilter: {
        backdropFilter: 'blur(20px)',
    },
});

export default globalStyles;
