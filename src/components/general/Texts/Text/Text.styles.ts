import FontSize from '../../../../lib/fontSize';
import { NLStyleSheetCreator } from '../../../../lib';
import Layout from '../../../../lib/layout';

const styles = NLStyleSheetCreator({
    title: {
        fontFamily: Layout.font.montserrat.bold,
    },
    text: {
        fontFamily: Layout.font.inter.regular,
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
    larger: {
        fontSize: FontSize.h2,
    },
    largest: {
        fontSize: FontSize.h1,
    },
});

export default styles;
