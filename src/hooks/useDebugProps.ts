/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-restricted-syntax */
import { useEffect } from 'react';

const useDebugProps = <T>(props: T, name: string) => {
    for (const key of Object.keys(props) as (keyof T)[]) {
        useEffect(() => {
            console.log(`prop => ${String(key)}`);
        }, [props[key]]);
    }
    console.log(`Rendering ${name || ''}`);
};

export default useDebugProps;
