import FontSize from '@src/lib/fontSize';
import { NLStyleSheetCreator } from '@src/lib';
import Layout from '@src/lib/layout';

const styles = NLStyleSheetCreator({
    title: {
        fontFamily: Layout.font.sf.bold,
        // color: Colors.textColor,
    },
    text: {
        fontFamily: Layout.font.sf.regular,
        // color: Colors.textColor,
    },
    code: {
        fontFamily: Layout.font.code.regular,
        // color: Colors.textColor,
    },
    light: {
        fontWeight: 'lighter',
    },
    regular: {
        fontWeight: 'normal',
    },
    bold: {
        fontWeight: 'bold',
    },
    bolder: {
        fontWeight: 'bolder',
    },
    smaller: {
        fontSize: FontSize.p,
    },
    small: {
        fontSize: FontSize.h5,
    },
    medium: {
        fontSize: FontSize.h4,
    },
    large: {
        fontSize: FontSize.h3,
    },
    largerish: {
        fontSize: FontSize.h2_small,
    },
    larger: {
        fontSize: FontSize.h2,
    },
    largermax: {
        fontSize: FontSize.h2_large,
    },
    largestish: {
        fontSize: FontSize.h1_small,
    },
    largest: {
        fontSize: FontSize.h1,
    },
});

export default styles;
