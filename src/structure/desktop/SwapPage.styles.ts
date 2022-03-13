import { NLStyleSheetCreator } from '@src/lib';

const styles = NLStyleSheetCreator({
    container: {
        display: 'flex',
        // justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        // filter: 'blur(20px)'
    },
    theRingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        zIndex: 0,
    },
    secondaryContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        position: 'absolute',
        padding: '2rem',
        zIndex: 1,
        pointerEvents: 'none',
    },
    innerContainer: {
        width: '25%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabletMain: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: '90%',
        width: '60%',
        padding: '2rem',
        zIndex: 0,
    },
    tabletRing: {
        height: '100%',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        // commented out to fix issue #67 - "my nuggs list"
        // position: 'absolute',
        alignItems: 'flex-start',
        zIndex: 0,
    },
    tabletRingAbout: {
        height: '20%',
        width: '80%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        zIndex: 1010,
    },
    tabletSecondary: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '90%',
        width: '40%',
        paddingRight: '2rem',
        position: 'absolute',
        right: 0,
    },
});

export default styles;
