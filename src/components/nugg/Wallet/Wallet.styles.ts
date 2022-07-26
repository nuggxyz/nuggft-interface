import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
	container: {
		height: '100%',
		width: '100%',
		display: 'flex',
		alignItems: 'center',
		zIndex: 100,
	},
	wallet: {
		display: 'flex',
		alignItems: 'center',
		flexDirection: 'column',
		justifyContent: 'space-between',
		width: '100%', // '430px',
		height: '80%',
		position: 'relative',
		// position: 'absolute',
		justifySelf: 'center',
		pointerEvents: 'auto',
	},
	body: {
		boxShadow: `${lib.layout.boxShadow.prefix} ${lib.colors.shadowNuggPink}`,
		borderRadius: lib.layout.borderRadius.medium,
		background: lib.colors.gradient3,
		padding: '.75rem',
	},
	bodyDark: {
		boxShadow: `${lib.layout.boxShadow.prefix} ${lib.colors.shadowNuggBlue}`,
		borderRadius: lib.layout.borderRadius.medium,
		background: lib.colors.transparentGrey,
		padding: '.75rem',
	},
	headerText: {
		color: lib.colors.nuggRedText,
	},
	mobileBody: {
		padding: '.5rem .4rem 0rem .4rem',
	},
	mobileHeaderText: {
		color: 'white',
	},
});

export default styles;
