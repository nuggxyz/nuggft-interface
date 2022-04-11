import type * as CSS from 'csstype';

export type { CSS };

declare module 'csstype' {
    // https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
    interface Properties extends CSS.PropertiesHyphen {
        // Add a CSS Custom Property
        '--dotnugg-stroke-width'?: number;
    }
}
