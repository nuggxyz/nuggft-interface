import lib from '@src/lib';
import globalStyles from '@src/lib/globalStyles';

const styles = lib.layout.NLStyleSheetCreator({
	searchBar: {
		zIndex: 999,
		borderRadius: lib.layout.borderRadius.small,
		...lib.layout.presets.font.main.regular,
		pointerEvents: 'auto',
		width: '93%',
		position: 'relative',
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	searchBarButton: {
		background: lib.colors.transparent,
		padding: '.5rem .5rem',
	},

	searchBarIcon: {
		color: lib.colors.nuggBlueText,
	},
	filterButton: {
		borderRadius: lib.layout.borderRadius.large,
		background: lib.colors.transparentWhite,
		padding: '.44rem .45rem',
		marginRight: '.3rem',
	},
	resultContainer: {
		position: 'absolute',
		background: lib.colors.white,
		borderRadius: lib.layout.borderRadius.mediumish,
		display: 'flex',
		flexDirection: 'column',
		overflow: 'hidden',
		// boxShadow: `${lib.layot.boxShadow.prefix} ${lib.layout.boxShadow.dark}`,
	},
	resultsList: {
		marginTop: '49px',
		height: '100%',
		width: '100%',
		overflow: 'scroll',
	},
	resultText: {
		width: '100%',
		height: '100%',
		...globalStyles.centered,
		padding: '.5rem',
	},
	resultListItemContainer: {
		width: '100%',
		padding: '1rem 1.5rem',
		position: 'relative',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	resultListItemId: {
		background: lib.colors.nuggBlueTransparent,
		borderRadius: lib.layout.borderRadius.large,
		padding: '.2rem .6rem',
		margin: '0rem .5rem',
	},
	resultListItemToken: {
		width: '70px',
		height: '70px',
	},
	separator: {
		position: 'absolute',
		height: '1px',
		bottom: 0,
		left: 20,
		right: 20,
		background: lib.colors.transparentGrey,
	},
	gradientText: {
		color: 'black',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundImage: lib.colors.gradient3,
	},
	gradientContainer: {
		borderRadius: lib.layout.borderRadius.large,
		backgroundColor: lib.colors.white,
		padding: '.2rem .1rem .2rem .7rem',
	},
});

export default styles;
