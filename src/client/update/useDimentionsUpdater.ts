import React, { useEffect } from 'react';

import client from '@src/client';

export default () => {
    const updateDimentions = client.mutate.updateDimentions();

    const resizer = React.useCallback(() => {
        updateDimentions({
            height: window.innerHeight,
            width: window.innerWidth,
        });
    }, [updateDimentions]);

    useEffect(() => {
        updateDimentions({
            height: window.innerHeight,
            width: window.innerWidth,
        });
        window.addEventListener('resize', resizer);
        return () => {
            window.removeEventListener('resize', resizer);
        };
    }, [resizer]);

    // console.log({ innerHeight, innerWidth });

    return null;
};

// export const useVisualViewport = () => {
//     const [viewport, setViewport] = React.useState({
//         height: window.visualViewport.height,
//         width: window.visualViewport.width,
//         offsetTop: window.visualViewport.offsetTop,
//         pageTop: window.visualViewport.pageTop,
//     });

//     const resizer = React.useCallback(() => {
//         setViewport({
//             height: window.visualViewport.height,
//             width: window.visualViewport.width,
//             offsetTop: window.visualViewport.offsetTop,
//             pageTop: window.visualViewport.pageTop,
//         });
//     }, [setViewport]);

//     useEffect(() => {
//         setViewport({
//             height: window.visualViewport.height,
//             width: window.visualViewport.width,
//             offsetTop: window.visualViewport.offsetTop,
//             pageTop: window.visualViewport.pageTop,
//         });
//         window.visualViewport.onresize = resizer;
//         return () => {
//             window.visualViewport.onresize = () => undefined;
//         };
//     }, [resizer]);

//     console.log(viewport);

//     return viewport;
// };

// export const useVisualViewport = (ref: RefObject<HTMLDivElement>) => {
//     const [innerHeight, setHeight] = React.useState(window.innerHeight);
//     const [innerWidth, setWidth] = React.useState(window.innerWidth);

//     const resizer = React.useCallback(() => {
//         if (ref.current) {
//             setHeight(ref.current..innerHeight);
//             setWidth(ref.current.innerWidth);
//         }

//     }, [setHeight, setWidth]);

//     useEffect(() => {
//         resizer();
//         if (ref.current) {
//             ref.current.onresize = resizer
//             return () => {
//                 if (ref.current) {

//                 ref.current.onresize = () => undefined
//                 }
//             };
//         }
//         return undefined

//     }, [resizer]);

//     console.log({ innerHeight, innerWidth });

//     return { innerHeight, innerWidth };
// };
