import React, { CSSProperties, useMemo } from 'react';

import { userAgent } from '@src/lib/userAgent';

const getParsed = (input: string) => {
    return Buffer.from(input.replace('data:image/svg+xml;base64,', ''), 'base64').toString('utf8');
};

const getPreScalar = (input: string) => {
    const str = input
        .replace('/svg">', '/svg" preserveAspectRatio="xMidYMid meet"  >')

        .replace('</style>', `</style><g class="R" >`)
        .replace('</svg>', '</g></svg>');

    return new DOMParser().parseFromString(str, 'image/svg+xml');
};

const getScalar = (svg: Document): { value: number; type: 'x' | 'y' } => {
    if (!svg || !svg.rootElement) return { value: 0, type: 'x' };

    const ayo2 = svg.rootElement.getBBox();

    const widthdiv = 62 / ayo2.width;
    const heightdiv = 62 / ayo2.height;

    if (widthdiv < heightdiv) {
        return { value: widthdiv, type: 'x' };
    }
    return { value: heightdiv, type: 'y' };
};

// const getPreTransform = (input: string, scale: { value: number; type: 'x' | 'y' }) => {
//     const str = input
//         .replace('/svg">', '/svg" preserveAspectRatio="xMidYMid meet"  >')

//         .replace(
//             '</style>',
//             `</style><g class="R" transform="scale(${scale.value})" style=" transform-origin: center center;">`,
//         )
//         .replace('</svg>', '</g></svg>');

//     return new DOMParser().parseFromString(str, 'image/svg+xml');
// };

const getTransform = (svg: Document): { x: number; y: number } => {
    if (!svg || !svg.rootElement) return { x: 0, y: 0 };

    const ayo2 = svg.rootElement.getBBox();

    ayo2.width++;
    ayo2.height++;
    // ayo2.x++;
    // ayo2.y++;

    // console.log('here', svg?.rootElement);
    // console.log(`--------------------------${name}----------------------`);

    // console.log('sup', ayo2);

    const centerX = ayo2.x + ayo2.width / 2;
    const centerY = ayo2.y + ayo2.height / 2;
    // const centerX = ayo2.x;
    // const centerY = ayo2.y;
    const x = 32 - centerX;
    const y = 32 - centerY;

    // console.log({ centerX, centerY, x, y });

    return { x, y };
};

const DangerouslySetNugg = ({
    imageUri,
    size,
    styles,
    cheat,
}: {
    imageUri: Base64EncodedSvg;
    styles?: CSSProperties;
    size: 'thumbnail' | 'showcase';
    cheat?: string;
}) => {
    // Buffer.from is the modern version of the below atob code
    // let svg = atob(data.replace('data:image/svg+xml;base64,', ''));
    const bug = Buffer.from(imageUri.replace('data:image/svg+xml;base64,', ''), 'base64').toString(
        'utf8',
    );

    const [scalar, setScalar] = React.useState<number>(1);
    const [heightTransform, setHeightTransform] = React.useState<number>(0);
    const [widthTransform, setWidthTransform] = React.useState<number>(0);

    const style = useMemo(() => {
        return `
         .R {
            //    transform: scale(${scalar});

         }

        `;
    }, [scalar]);

    React.useEffect(() => {
        const svg = getParsed(imageUri);

        const prescaleSvg = getPreScalar(svg);

        const scale = getScalar(prescaleSvg);

        const trans = getTransform(prescaleSvg);

        setScalar(scale.value);
        setHeightTransform(trans.y);
        setWidthTransform(trans.x);
    }, [imageUri, setScalar, setHeightTransform, setWidthTransform, cheat]);

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
                id={imageUri}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                    __html: bug
                        .replace('.A.B.C.D.E.F.G.H', style)
                        .replace('/svg">', '/svg" preserveAspectRatio="xMidYMid meet"  >')

                        .replace(
                            '</style>',
                            `</style><g class="R" transform="scale(${scalar}) translate(${widthTransform},${heightTransform})" style=" transform-origin: center center;">`,
                        )
                        .replace('</svg>', '</g></svg>'),
                }}
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
