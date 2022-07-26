import lib, { NLStyleSheetCreator } from '@src/lib';

const styles = NLStyleSheetCreator({
	title: {
		marginBottom: '1.5rem',
		textAlign: 'center',
		width: '100%',
	},
	text: {
		marginBottom: '1rem',
	},
	actionButton: {
		color: lib.colors.white,
		boxShadow: lib.layout.boxShadow.basic,
		padding: '.7rem 1.3rem',

		background: lib.colors.primaryColor,
		borderRadius: lib.layout.borderRadius.large,
		marginBottom: 15,
	},
	buttonContainer: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: '1rem',
		textAlign: 'center',
	},
});

export default styles;
