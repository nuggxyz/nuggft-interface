import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
	container: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		padding: '2rem 0rem',
	},
	textContainer: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-around',
		padding: '1rem',
	},
});

export default styles;
