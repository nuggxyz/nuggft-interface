import React from 'react';

export default <T>(arg: T | undefined): T | undefined => {
    const [stable, setStable] = React.useState<T>();

    React.useEffect(() => {
        setTimeout(() => {
            setStable(arg);
        }, 1000);
    }, [arg]);

    return __DEV__ ? stable : arg;
};
