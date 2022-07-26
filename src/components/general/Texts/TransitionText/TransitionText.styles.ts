import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
	container: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		cursor: 'pointer',
	},
	textContainer: {
		display: 'flex',
		justifyContent: 'flex-start',
		position: 'relative',
	},
	hidden: {
		pointerEvents: 'none',
		visibility: 'hidden',
	},
	text: {
		position: 'fixed',
		whiteSpace: 'nowrap',
	},
});

export default styles;
