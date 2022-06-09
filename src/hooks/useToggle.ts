import { useCallback, useState } from 'react';

const useToggle = <T>(
    state: T,
    // @ts-ignore
    initialState: T[number][],
    // @ts-ignore
): [T[number][], (state: T[number]) => void, T] => {
    const [toggled, setToggled] = useState(initialState);

    const toggle = useCallback(
        // @ts-ignore
        (_state: T[number]) => {
            if (toggled.includes(_state)) {
                const temp = [...toggled];
                temp.splice(toggled.indexOf(_state), 1);
                setToggled(temp);
            } else {
                setToggled([...toggled, _state]);
            }
        },
        [toggled, setToggled],
    );

    return [toggled, toggle, state];
};

export default useToggle;
