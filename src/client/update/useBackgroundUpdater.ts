import { useEffect } from 'react';

// eslint-disable-next-line import/no-cycle
import { useDarkMode } from '@src/client/hooks/useDarkMode';
import { userAgent } from '@src/lib/userAgent';

const initialStyles = {
    width: '200vw',
    height: '200vh',
    transform: 'translate(-50vw, -100vh)',
    backgroundBlendMode: '',
};
const backgroundResetStyles = {
    width: '100vw',
    height: 'calc(var(--window-inner-height) - 1px)',
    transform: 'unset',
    backgroundBlendMode: '',
};

if (
    userAgent.browser.name === 'Safari' ||
    userAgent.browser.name === 'Mobile Safari' ||
    userAgent.browser.name === 'Firefox'
) {
    /// // hack to kill the horizontal see-through lines on modern safari
    // tried to solve with these, but none did the trick
    // svg.rootElement.setAttribute('width', '100%');
    // svg.rootElement.setAttribute('image-rendering', 'pixelated');
    // svg.rootElement.setAttribute('stroke-width', '1');
    // svg.rootElement.setAttribute('shape-rendering', 'geometricPrecision');
    // svg.rootElement.setAttribute('vector-effect', 'non-scaling-stroke');
    // svg.rootElement.setAttribute('y', '.5');
    // svg.rootElement.setAttribute('x', '.5');
    // svg.rootElement.setAttribute('transform', `translate(0,0)`);
    // g.setAttribute('shape-rendering', 'crispEdges');
}

type TargetBackgroundStyles = typeof initialStyles | typeof backgroundResetStyles;

// const rootElement = document.getElementById('root');

const backgroundRadialGradientElement = document.getElementById('background-radial-gradient');

const setBackground = (newValues: TargetBackgroundStyles) =>
    Object.entries(newValues).forEach(([key, value]) => {
        if (backgroundRadialGradientElement) {
            backgroundRadialGradientElement.style[key as keyof typeof backgroundResetStyles] =
                value;
        }
    });

// const setBackground = (newValues: TargetBackgroundStyles) =>
//     rootElement.setAttribute('style', `stroke-width: ${size === 'thumbnail' ? 1.2 : 1.05}`);

export default (): null => {
    const darkMode = useDarkMode();

    // manage background color
    useEffect(() => {
        if (!backgroundRadialGradientElement) {
            return;
        }

        const lightGradient =
            'radial-gradient(153.32% 100% at 47.26% 0%, rgb(80, 144, 234, .15) 0%, rgba(80, 144, 234, 0.06) 1000%), #FFFFFF';
        const darkGradient =
            'radial-gradient(150.6% 98.22% at 48.06% 0%, rgba(80, 144, 234, .34) 0%, rgb(80, 144, 234, 0.1) 1000%), #000000';

        if (darkMode) {
            setBackground(backgroundResetStyles);

            backgroundRadialGradientElement.style.background = darkGradient;
        } else {
            setBackground(backgroundResetStyles);

            backgroundRadialGradientElement.style.background = lightGradient;
        }
    }, [darkMode]);

    useEffect(() => {
        if (!backgroundRadialGradientElement) {
            return;
        }

        const lightGradient =
            'radial-gradient(153.32% 100% at 47.26% 0%, rgb(80, 144, 234, .15) 0%, rgba(80, 144, 234, 0.06) 1000%), #FFFFFF';
        const darkGradient =
            'radial-gradient(150.6% 98.22% at 48.06% 0%, rgba(80, 144, 234, .34) 0%, rgb(80, 144, 234, 0.1) 1000%), #000000';

        if (darkMode) {
            setBackground(backgroundResetStyles);

            backgroundRadialGradientElement.style.background = darkGradient;
        } else {
            setBackground(backgroundResetStyles);

            backgroundRadialGradientElement.style.background = lightGradient;
        }
    }, [darkMode]);

    return null;
};
