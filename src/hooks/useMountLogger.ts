import React from 'react';

export default (name: string) => {
    React.useEffect(() => {
        console.log(
            `mount   ${name}`,
            new Date().getSeconds(), // logs minutes
            new Date().getMilliseconds(), // logs seconds so that you can check diff in browser
        );
        return () => {
            console.log(
                `unmount ${name}`,
                new Date().getSeconds(), // logs minutes
                new Date().getMilliseconds(), // logs seconds so that you can check diff in browser
            );
        };
    }, []);

    return null;
};

export const useUpdateLogger = (name: string, value: unknown) => {
    React.useEffect(() => {
        console.log(`update:   ${name}`);
    }, [value]);

    return null;
};
