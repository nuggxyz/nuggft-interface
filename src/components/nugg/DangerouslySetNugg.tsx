import React, { CSSProperties } from 'react';

import { userAgent } from '@src/lib/userAgent';

const getParsed = (input: string) => {
    // Buffer.from is the modern version of the below atob code

    return Buffer.from(input.replace('data:image/svg+xml;base64,', ''), 'base64').toString('utf8');
};

const getSvgObject = (input: string) => {
    const str = input
        .replace('/svg">', '/svg" preserveAspectRatio="xMidYMid meet"  >')
        .replace('</style>', `</style><g  class="R" >`)
        .replace('</svg>', '</g></svg>');

    return new DOMParser().parseFromString(str, 'image/svg+xml');
};

const getBoundingBox = (svg: Document) => {
    return svg.rootElement?.getBBox();
};

const getScalar = (rect: DOMRect): { value: number; type: 'x' | 'y' } => {
    const widthdiv = 62 / rect.width;
    const heightdiv = 62 / rect.height;

    if (widthdiv < heightdiv) {
        return { value: widthdiv, type: 'x' };
    }
    return { value: heightdiv, type: 'y' };
};

const getTransform = (rect: DOMRect): { x: number; y: number } => {
    rect.width++;
    rect.height++;

    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;

    const x = 32 - centerX;
    const y = 32 - centerY;

    return { x, y };
};

const DangerouslySetNugg = ({
    imageUri,
    size,
    styles,
}: {
    imageUri: Base64EncodedSvg;
    styles?: CSSProperties;
    size: 'thumbnail' | 'showcase';
}) => {
    const id = React.useId();

    React.useEffect(() => {
        const svgString = getParsed(imageUri);

        const svg = getSvgObject(svgString);

        const box = getBoundingBox(svg);

        const g = svg.firstElementChild?.firstElementChild?.nextElementSibling;

        const div = document.getElementById(id);

        if (!div || !g || !svg.rootElement || !box) return;

        const scale = getScalar(box);

        const trans = getTransform(box);

        g.setAttribute('transform', `scale(${scale.value}) translate(${trans.x},${trans.y})`);

        g.setAttribute('style', `transform-origin: center center;`);

        div.innerHTML = '';

        div.appendChild(svg.rootElement);
    }, [imageUri, id]);

    return (
        <>
            <div className="B" style={{ stroke: 'red' }} />
            <div
                style={{
                    ...styles,
                    // hack to kill the horizontal see-through lines on modern safari
                    ...(userAgent.browser.name === 'Firefox' ||
                    userAgent.browser.name === 'Safari' ||
                    userAgent.browser.name === 'Mobile Safari'
                        ? { strokeWidth: size === 'showcase' ? 1.07 : 1.5 }
                        : {}),
                }}
                id={id}
            />
        </>
    );
};

export default DangerouslySetNugg;

// const centerX = ayo2.x + Math.floor(ayo2.width / 2);
// const centerY = ayo2.y + Math.floor(ayo2.height / 2);

// const offsetX = 32 - centerX;
// const offsetY = 32 - centerY;

// console.log({ centerX, centerY, offsetX, offsetY });

// if (!ayo2) return;

// const widthdiv = 63 / ayo2.width;
// const heightdiv = 63 / ayo2.height;

// // const centerX = ayo2.x + Math.floor(ayo2.width / 2) + 1;
// // const centerY = ayo2.y + Math.floor(ayo2.height / 2) + 1;
// const centerX = ayo2.x;
// const centerY = ayo2.y;
// const offsetX = 32 - centerX;
// const offsetY = 32 - centerY;

// console.log({ centerX, centerY, offsetX, offsetY });

// if (!ayo2) return;

// const widthdiv = 63 / ayo2.width;
// const heightdiv = 63 / ayo2.height;

// console.log({ widthdiv, heightdiv });

// setHeightTransform(offsetX * -1);
// setWidthTransform(offsetY * -1);

// const cb = React.useCallback(
//     (input: string) => {
//         const svg = new DOMParser().parseFromString(input, 'image/svg+xml');

//         if (!svg || !svg.rootElement) return 0;

//         const ayo2 = svg.rootElement.getBBox();

//         // const ayo3 = svg.rootElement.lastElementChild as typeof svg.rootElement | null;

//         if (size !== 'showcase') return 0;
//         console.log('------------------------------------------------');
//         ayo2.width++;
//         ayo2.height++;
//         ayo2.x++;
//         ayo2.y++;
//         console.log(cheat, 'svg', ayo2);

//         // console.log('here', svg?.rootElement);

//         // console.log('sup', ayo3.getBBox());

//         const centerX = ayo2.x + Math.floor(ayo2.height / 2);
//         const centerY = ayo2.y + Math.floor(ayo2.width / 2);
//         // const centerX = ayo2.x;
//         // const centerY = ayo2.y;
//         const offsetX = 32 - centerX;
//         const offsetY = 32 - centerY;

//         console.log({ centerX, centerY, offsetX, offsetY });

//         if (!ayo2) return 0;

//         const widthdiv = 63 / ayo2.width;
//         const heightdiv = 63 / ayo2.height;

//         console.log({ widthdiv, heightdiv });

//         // setHeightTransform(offsetX * -1);
//         // setWidthTransform(offsetY * -1);

//         let lscalar = 0;

//         if (widthdiv < heightdiv) {
//             setScalar((lscalar = widthdiv));
//             setWidthTransform(offsetX);

//             setHeightTransform(0);
//         } else {
//             setScalar((lscalar = heightdiv));
//             setHeightTransform(offsetY);
//             setWidthTransform(0);
//         }

//         return lscalar;
//         // setWidthTransform(0);
//         // setHeightTransform(0);
//     },
//     [setScalar, setHeightTransform, setWidthTransform, imageUri, cheat, size, style],
// );
