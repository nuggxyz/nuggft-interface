import { useEffect } from 'react';

// eslint-disable-next-line import/no-cycle
import { useDarkMode } from '@src/client/hooks/useDarkMode';

const initialStyles = {
    width: '200vw',
    height: '200vh',
    transform: 'translate(-50vw, -100vh)',
    backgroundBlendMode: '',
};
const backgroundResetStyles = {
    width: '100vw',
    height: '100vh',
    transform: 'unset',
    backgroundBlendMode: '',
};

type TargetBackgroundStyles = typeof initialStyles | typeof backgroundResetStyles;

const backgroundRadialGradientElement = document.getElementById('background-radial-gradient');

const setBackground = (newValues: TargetBackgroundStyles) =>
    Object.entries(newValues).forEach(([key, value]) => {
        if (backgroundRadialGradientElement) {
            backgroundRadialGradientElement.style[key as keyof typeof backgroundResetStyles] =
                value;
        }
    });

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

    return null;
};
