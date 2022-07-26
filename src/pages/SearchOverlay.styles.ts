import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
	container: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'space-between',
	},
	nuggDexContainer: {
		display: 'flex',
		width: '45%',
		height: '100%',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
	},
	tokenContainer: {
		display: 'flex',
		width: '45%',
		height: '100%',
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center',
		position: 'relative',
		overflow: 'scroll',
	},
});

export default styles;
