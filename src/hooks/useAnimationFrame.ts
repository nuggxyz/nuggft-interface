import { useCallback, useEffect, useRef } from 'react';

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [...dependencyArray, callback],
    );

    useEffect(() => {
        previousRequest.current = requestAnimationFrame(animate);
        return () => {
            if (previousRequest.current !== undefined)
                cancelAnimationFrame(previousRequest.current);
        };
    }, [animate]);
};

export default useAnimationFrame;
