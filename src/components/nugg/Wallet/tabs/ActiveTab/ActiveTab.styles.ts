import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
	badge: {
		color: lib.colors.secondaryColor,
		background: lib.colors.nuggRedText,
		borderRadius: lib.layout.borderRadius.large,
		padding: '.1rem .4rem ',
		position: 'absolute',
		top: '-.3rem',
		right: '-.3rem',
	},
	container: {
		width: '100%',
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
	},
	flyout: {
		// position: 'absolute',
		top: '.4rem',
		right: '.4rem',
	},
	flyoutButton: {
		background: lib.colors.gradient2Transparent,
		borderRadius: lib.layout.borderRadius.large,
		padding: '.25rem .25rem 0rem .25rem',
	},
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
	mainStatistic: {
		alignItems: 'center',
		margin: '0rem',
	},
	mintNuggButton: {
		background: lib.colors.white,
		borderRadius: lib.layout.borderRadius.large,
		margin: '0rem',
		padding: '.2rem .6rem',
	},
	mintNuggButtonText: {
		color: lib.colors.nuggRedText,
		fontSize: lib.fontSize.h6,
		...lib.layout.presets.font.main.regular,
	},
	myNuggItemContainer: {
		display: 'flex',
		padding: '.5rem 1rem',
		background: lib.colors.transparentLightGrey,
		justifyContent: 'space-between',
		alignItems: 'center',
		// width: '100%',
		borderRadius: lib.layout.borderRadius.medium,
		margin: '0rem 0rem',
	},
	phoneAccountViewer: {
		background: lib.colors.transparentWhite,
		padding: '12px 10px',
		borderRadius: lib.layout.borderRadius.medium,
		width: '48%',
	},
	phoneContainer: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	textRed: {
		color: lib.colors.nuggRedText,
	},
	textWhite: {
		color: lib.colors.white,
	},
	searchButton: {
		borderRadius: lib.layout.borderRadius.large,
		padding: '.5rem .5rem',
		background: lib.colors.gradient3Transparent,
	},
	statistic: {
		width: '31%',
		marginLeft: '0rem',
		marginRight: '0rem',
		alignItems: 'center',
		display: 'flex',
	},
});

export default styles;
