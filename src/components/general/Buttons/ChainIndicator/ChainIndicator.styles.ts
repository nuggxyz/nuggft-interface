import lib from '@src/lib';

const styles = lib.layout.NLStyleSheetCreator({
	button: {
		borderRadius: lib.layout.borderRadius.large,
		fontSize: lib.fontSize.p,
		transition: `all 0.5s ease`,
		flexWrap: 'nowrap',
		flexGrow: 2,
		dipaly: 'flex',
		alignItems: 'center',
		padding: '.1rem',
	},
	normal: {
		background: lib.colors.semiTransparentWhite,
		color: lib.colors.nuggBlueText,
	},
	warning: {
		background: lib.colors.nuggRedTransparent,
		color: lib.colors.nuggRedText,
	},
	buttonDefault: {
		background: lib.colors.secondaryColor,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: lib.layout.borderRadius.small,
		flexDirection: 'row',
		padding: '.5rem 1rem',
		cursor: 'pointer',
		color: 'black',
		transition: 'filter .2s ease',
	},
	text: {
		margin: 0,
	},
});

export default styles;
