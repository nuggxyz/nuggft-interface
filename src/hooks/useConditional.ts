export default <T extends string>(cond: T, hooks: { [key in T]: (...args: any[]) => null }) => {
	((): (() => null) => {
		return hooks[cond];
	})();
};
