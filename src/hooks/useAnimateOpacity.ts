import lib from "@src/lib";
import {CSSProperties} from "react";

const useAnimateOpacity = (isVisible: boolean, style?: CSSProperties) => {
	return {
		opacity: isVisible ? 1 : 0,
		transition: `opacity .5s ${lib.layout.animation}`,
		pointerEvents: isVisible ? ('auto' as const) : ('none' as const),
		...style,
	};
};

export default useAnimateOpacity;
