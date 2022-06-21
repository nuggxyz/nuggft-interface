import * as React from 'react';

const useForceUpdate = () => {
    const [, setValue] = React.useState(0); // integer state
    return () => setValue((value: number) => value + 1); // update the state to force render
};

export const useForceUpdateWithVar = () => {
    const [val, setValue] = React.useState(0); // integer state
    return [val, () => setValue((value: number) => value + 1)] as const; // update the state to force render
};

export default useForceUpdate;
