import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
	container: {
		background: lib.colors.gradient3,
		borderRadius: lib.layout.borderRadius.medium,
		display: 'flex',
		boxShadow: `${lib.layout.boxShadow.prefix} ${lib.colors.shadowNuggPink}`,
		flexDirection: 'column',
		padding: '.5rem',
		width: '50%',
	},
	subContainer: {
		width: '50%',
		whiteSpace: 'nowrap',
		display: 'flex',
		flexDirection: 'column',
		padding: '0rem .25rem',
	},
	chart: {
		background: lib.colors.transparentWhite,
		borderRadius: lib.layout.borderRadius.smallish,
		padding: 0,
	},
});

export default styles;
