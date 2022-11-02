import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
	balance: {
		color: lib.colors.textColor,
		borderRadius: lib.layout.borderRadius.large,
		pointerEvents: 'auto',
	},
	textContainer: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		background: lib.colors.nuggBlueTransparent,
		boxShadow: lib.layout.boxShadow.basic,
		padding: '.5rem',
		borderRadius: lib.layout.borderRadius.mediumish,
	},
	header: {
		display: 'flex',
		justifyContent: 'center',
		flexDirection: 'column',
		alignItems: 'flex-end',
	},
	text: {
		color: lib.colors.nuggBlueText,
		marginRight: '.3rem',
	},
	flyout: {
		right: '1rem',
		width: '12rem',
		// top: '1.5rem',
	},
	flyoutButton: {
		padding: '.75rem 1rem .75rem 1rem',
		borderRadius: 0,
		background: 'white',
		width: '100%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'start',
	},
});

export default styles;
