const Layout = {
    window: {
        width: window.innerWidth,
        height: window.innerHeight,
    },
    header: {
        height: '5rem',
    },
    sideModal: {
        width: '40rem',
    },
    animation: 'cubic-bezier(.08,.44,.54,.98)', // 'cubic-bezier(0.165, 0.84, 0.44, 1)',
    smallDeviceWidth: 820,
    borderRadius: {
        small: '.3rem',
        smallish: '.4rem',
        mediumish: '.85rem',
        medium: '1rem',
        largish: '1.5rem',
        large: '2rem',
    },
    boxShadow: {
        sample1: 'rgba(149, 157, 165, 0.2) 0px 8px 24px',
        sample2: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
        basic: '0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04), 0px 24px 32px rgba(0, 0, 0, 0.01)',
        medium: '2px 3px 5px rgba(102, 102, 102,0.2)',
        dark: '0 6px 10px rgba(102, 102, 102,0.4)',

        prefix: '0 6px 10px',
        overlay: '2px 3px 5px rgba(0, 0, 0, 0.3)',
    },
    textShadow: {
        heavy: '0px 3px 3px rgba(0,0,0,0.4),0px 8px 13px rgba(0,0,0,0.1), 0px 18px 23px rgba(0,0,0,0.1)',
        basic: '2px 3px 5px rgba(0,0,0,0.5)',
    },
    font: {
        sf: {
            light: 'SFProRounded-Light',
            regular: 'SFProRounded-Regular',
            bold: 'SFProRounded-Bold',
            semibold: 'SFProRounded-Semibold',
        },
        code: {
            light: 'SF-Mono',
            regular: 'SF-Mono',
            bold: 'SF-Mono',
            semibold: 'SF-Mono',
        },
    },
    presets: {
        font: {},
    },
};

export type SimpleSizes = 'small' | 'medium' | 'large' | 'larger' | 'smaller' | 'largest';

export default Layout;
