import React, { useState } from 'react';

// Hook
export default function useLocalStorage<T>(key: string, initialValue: T) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key) as string | undefined;
            // Parse stored json or if none return initialValue
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch (error) {
            // If error also return initialValue
            console.log(error);
            return initialValue;
        }
    });
    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue: ReactSetState<T> = React.useCallback(
        (value) => {
            try {
                // Allow value to be a function so we have same API as useState
                const valueToStore = value instanceof Function ? value(storedValue) : value;
                // Save state
                setStoredValue(valueToStore);
                // Save to local storage
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
            } catch (error) {
                // A more advanced implementation would handle the error case
                console.log(error);
            }
        },
        [storedValue, setStoredValue, key],
    );

    const setKey = React.useCallback(
        (k: keyof T, v: T[typeof k]) => {
            setValue((curr) => {
                curr[k] = v;
                return curr;
            });
        },
        [setValue],
    );

    const clear = React.useCallback(() => {
        setValue(initialValue);
    }, [setValue, initialValue]);

    // const readKey = React.useCallback(
    //     (val: keyof T): T[typeof val] | undefined => {
    //         // Get from local storage by key
    //         const item = window.localStorage.getItem(key) as string | undefined;

    //         // Parse stored json or if none return initialValue
    //         const parsed = item ? (JSON.parse(item) as T) : undefined;

    //         return parsed ? parsed[val] : undefined;
    //     },
    //     [key],
    // );

    return { value: storedValue, setKey, clear };
}

// export function useReadLocalStorage<T>(key: string, val: keyof T): T[typeof val] | undefined {
//     return React.useMemo(() => {
//         // Get from local storage by key
//         const item = window.localStorage.getItem(key) as string | undefined;

//         // Parse stored json or if none return initialValue
//         const parsed = item ? (JSON.parse(item) as T) : undefined;

//         return parsed ? parsed[val] : undefined;
//     }, [key, val]);
// }

// export function useWriteLocalStorage<T>(key: string, val: keyof T): T[typeof val] | undefined {
//     const cb: SetState<T> = React.useCallback(
//         (value) => {
//             try {
//                 // Allow value to be a function so we have same API as useState
//                 const valueToStore = value instanceof Function ? value(storedValue) : value;
//                 // Save state
//                 setStoredValue(valueToStore);
//                 // Save to local storage
//                 if (typeof window !== 'undefined') {
//                     window.localStorage.setItem(key, JSON.stringify(valueToStore));
//                 }
//             } catch (error) {
//                 // A more advanced implementation would handle the error case
//                 console.log(error);
//             }
//         },
//         [key, val],
//     );

//     return cb;
// }
