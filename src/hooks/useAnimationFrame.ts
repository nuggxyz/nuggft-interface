import { useCallback, useEffect, useRef } from 'react';

type Props = Record<string, never>;

const useAnimationFrame = (
    callback: (time: number) => void,
    dependencyArray: React.DependencyList,
) => {
    const previousTime = useRef<number>();
    const previousRequest = useRef<number>();

    const animate = useCallback(
        (time: number) => {
            if (previousTime.current !== undefined) {
                const deltaTime = time - previousTime.current;
                callback(deltaTime);
            }
            previousTime.current = time;
            previousRequest.current = requestAnimationFrame(animate);
        },
        [...dependencyArray, callback],
    );

    useEffect(() => {
        previousRequest.current = requestAnimationFrame(animate);
        return () => {
            previousRequest.current !== undefined && cancelAnimationFrame(previousRequest.current);
        };
        // @ts-ignore
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [animate]);
};

export default useAnimationFrame;
