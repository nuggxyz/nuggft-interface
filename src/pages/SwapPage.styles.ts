import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
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
		height: '90%',
		width: '65%',
		padding: '2rem',
		zIndex: 0,
	},
	tabletRing: {
		height: '50%',
		width: '100%',
		display: 'flex',
		justifyContent: 'center',
		// commented out to fix issue #67 - "my nuggs list"
		// position: 'absolute',
		alignItems: 'flex-start',
		zIndex: 0,
	},
	tabletRingAbout: {
		flexDirection: 'column',

		// height: '20%',
		width: '550px',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'flex-end',
		// position: 'absolute',
		zIndex: 1010,
	},
	tabletSecondary: {
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		height: '90%',
		width: '35%',
		paddingRight: '2rem',
		// position: 'absolute',
		// right: 0,
	},
});

export default styles;
