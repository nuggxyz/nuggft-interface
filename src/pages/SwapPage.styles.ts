import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
	container: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		height: '100%',
		position: 'relative',
		// filter: 'blur(20px)'
	},
	theRingContainer: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: '100%',
		width: '100%',
		pointerEvents: 'none',
		zIndex: 0,
		paddingTop: lib.layout.header.height,
		paddingBottom: lib.layout.header.height,
	},
	secondaryContainer: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		height: '100%',
		width: '100%',
		position: 'absolute',
		padding: '0rem 2rem',
		zIndex: 0,
		pointerEvents: 'none',
		paddingTop: lib.layout.header.height,
		paddingBottom: lib.layout.header.height,
	},
	innerContainer: {
		width: '27%',
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	tabletMain: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'flex-start',
		alignItems: 'center',
		height: '100%',
		width: '60%',
		padding: '2rem',
		zIndex: 1,
		paddingTop: lib.layout.header.height,
		paddingBottom: lib.layout.header.height,
	},
	tabletRing: {
		height: '70%',
		width: '100%',
		display: 'flex',
		justifyContent: 'center',
		// commented out to fix issue #67 - "my nuggs list"
		// position: 'absolute',
		alignItems: 'flex-start',
		zIndex: 1,
		pointerEvents: 'none',
	},
	tabletRingAbout: {
		flexDirection: 'column',
		width: '550px',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'flex-end',
		zIndex: 0,
	},
	tabletSecondary: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		height: '100%',
		width: '40%',
		paddingRight: '2rem',
		paddingTop: lib.layout.header.height,
		paddingBottom: lib.layout.header.height,
		zIndex: 0,
	},
});

export default styles;
