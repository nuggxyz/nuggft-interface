/* eslint-disable react/require-default-props */
import React, { CSSProperties } from 'react';

const getParsed = (input: string) => {
    if (input.startsWith('ERROR') || input === '') {
        return '<svg></svg>';
    }
    if (input.startsWith('data:image/svg+xml;charset=UTF-8,')) {
        return input.replace('data:image/svg+xml;charset=UTF-8,', '');
    }
    // Buffer.from is the modern version of atob
    return Buffer.from(input.replace('data:image/svg+xml;base64,', ''), 'base64').toString('utf8');
};

const getSvgObject = (input: string) => {
    const str = input;
    // .replace('.A.B.C.D.E.F.G.H', ``)
    // // unessesary - it is the default behavior
    // // .replace('/svg">', '/svg" preserveAspectRatio="xMidYMid meet"  >')
    // .replace('</style>', `</style><g  class="R" >`)
    // .replace('</svg>', '</g></svg>');

    return new DOMParser().parseFromString(str, 'image/svg+xml');
};

// const getBoundingBox = (svg: Document) => {
//     if (!svg.rootElement) return undefined;

//     const tempDiv = document.createElement('div');

//     tempDiv.setAttribute('style', 'position:absolute; visibility:hidden; width:0; height:0');

//     const tempSvg = svg.rootElement.cloneNode(true) as SVGSVGElement;

//     tempDiv.appendChild(tempSvg);

//     document.body.appendChild(tempDiv);

//     const bbox = tempSvg.getBBox();

//     document.body.removeChild(tempDiv);

//     return bbox;
// };

// const getScalar = (rect: DOMRect): { value: number; type: 'x' | 'y' } => {
//     const widthdiv = 62 / rect.width;
//     const heightdiv = 62 / rect.height;

//     if (widthdiv < heightdiv) {
//         return { value: widthdiv, type: 'x' };
//     }
//     return { value: heightdiv, type: 'y' };
// };

// const getTransform = (rect: DOMRect): { x: number; y: number } => {
//     // rect.width++;
//     // rect.height++;

//     const centerX = rect.x + (rect.width + 1) / 2;
//     const centerY = rect.y + (rect.height + 1) / 2;

//     const x = 32 - centerX;
//     const y = 32 - centerY;

//     return { x, y };
// };

const DangerouslySetNugg = React.memo(
    ({
        imageUri,
        size,
    }: // style,
    {
        imageUri?: Base64EncodedSvg | null;
        style?: CSSProperties;
        size: 'thumbnail' | 'showcase';
    }) => {
        const id = React.useId();

        React.useEffect(() => {
            if (imageUri) {
                const svgString = getParsed(imageUri);

                const svg = getSvgObject(svgString);

                // svg.rootElement?.setAttribute("style").style.zIndex = styles?.zIndex;
                const div = document.getElementById(id);

                if (!div || !svg.rootElement) return;
                svg.rootElement.id = id;
                svg.rootElement.classList.add('customized-dotnugg');
                div.replaceWith(svg.rootElement);
                div.classList.add();
                div.style.filter = 'drop-shadow(2px 3px 5px rgb(0 0 0 / 0.4))';
                // console.log(style);
                // if (style?.zIndex) {
                //     svg.rootElement.style.zIndex = style.zIndex as string;
                // }
                // svg.rootElement.style.zIndex = '1000000';
                // div.innerHTML = '';

                // div.appendChild(svg.rootElement);
            } else {
                const div = document.getElementById(id);
                if (!div) return;
                div.innerHTML = '';
            }

            // const box = getBoundingBox(svg);

            // const g = svg.firstElementChild?.firstElementChild?.nextElementSibling;

            // const scale = getScalar(box);

            // const trans = getTransform(box);

            // if (size === 'showcase') console.log({ box, scale, trans });

            // g.setAttribute('transform', `scale(${scale.value}) translate(${trans.x},${trans.y})`);

            // g.setAttribute('style', ` transform-origin: center center;`);
            // g.setAttribute('stroke', `1`);
            // g.setAttribute('fill', `1`);

            // if (
            //     userAgent.browser.name === 'Safari' ||
            //     userAgent.browser.name === 'Mobile Safari' ||
            //     userAgent.browser.name === 'Firefox'
            // ) {
            //     /// // hack to kill the horizontal see-through lines on modern safari
            //     svg.rootElement.setAttribute(
            //         'style',
            //         `stroke-width: ${size === 'thumbnail' ? 1.2 : 1.05}`,
            //     );
            //     // tried to solve with these, but none did the trick
            //     // svg.rootElement.setAttribute('width', '100%');
            //     // svg.rootElement.setAttribute('image-rendering', 'pixelated');
            //     // svg.rootElement.setAttribute('stroke-width', '1');
            //     // svg.rootElement.setAttribute('shape-rendering', 'geometricPrecision');
            //     // svg.rootElement.setAttribute('vector-effect', 'non-scaling-stroke');
            //     // svg.rootElement.setAttribute('y', '.5');
            //     // svg.rootElement.setAttribute('x', '.5');
            //     // svg.rootElement.setAttribute('transform', `translate(0,0)`);
            //     // g.setAttribute('shape-rendering', 'crispEdges');
            // }
        }, [imageUri, id, size]);

        return <svg id={id} />;

        // return <div style={{ ...style, ...strokeWidth }} id={id} />;
    },
    (prev, curr) => prev.imageUri === curr.imageUri,
);

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
