import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
	container: { width: '100%', height: '100%', display: 'flex', flexDirection: 'column' },
	list: {
		background: lib.colors.transparentLightGrey,
		borderRadius: lib.layout.borderRadius.mediumish,
		padding: ' .65rem ',
		flexGrow: 1,
		minHeight: '100px',
		height: '100%',
	},
	listLabel: {
		color: lib.colors.white,
		paddingTop: '0rem',
	},
	multiLoanButton: {
		background: lib.colors.white,
		borderRadius: 0,
		margin: '0rem',
		padding: '.5rem .8rem',
		display: 'flex',
		justifyContent: 'space-between',
	},
	multiLoanButtonText: {
		color: lib.colors.nuggRedText,
		fontSize: lib.fontSize.h6,
		...lib.layout.presets.font.main.regular,
	},
	renderItemButton: {
		background: lib.colors.gradient2,
		borderRadius: lib.layout.borderRadius.large,
		padding: '.2rem .6rem',
	},
	renderItemContainer: {
		display: 'flex',
		padding: '.5rem',
		background: 'white',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		borderRadius: lib.layout.borderRadius.medium,
		margin: '.25rem 0rem',
	},
	renderItemNugg: {
		width: '50px',
		height: '50px',
	},
	textBlue: {
		color: lib.colors.nuggBlueText,
	},
	textDefault: {
		color: lib.colors.textColor,
	},
	textWhite: {
		color: lib.colors.white,
	},
});

export default styles;
