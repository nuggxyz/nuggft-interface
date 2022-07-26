import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
	container: {
		zIndex: 1,
	},
	childrenContainer: {
		position: 'absolute',
		alignItems: 'center',
		display: 'flex',
		justifyContent: 'center',
		flexDirection: 'column',
	},
	svgTransition: {
		transition: 'all .5s ease',
		transformBox: 'fill-box',
		transformOrigin: 'center',
		transform: 'rotate(-90deg)',
	},
});

export default styles;
