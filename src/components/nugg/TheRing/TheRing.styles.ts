import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
	circle: {
		position: 'relative',
		justifyContent: 'center',
		alignItems: 'center',
		width: '100%',
		height: '100%',
		display: 'flex',
		left: 0,
		zIndex: 100,
	},
} as const);

export default styles;
