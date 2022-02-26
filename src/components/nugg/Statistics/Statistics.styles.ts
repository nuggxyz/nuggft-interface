import { NLStyleSheetCreator } from '@src/lib';
import FontSize from '@src/lib/fontSize';
import Layout from '@src/lib/layout';

const styles = NLStyleSheetCreator({
    value: {
        fontFamily: Layout.font.code.regular,
        marginLeft: '.5rem',
        fontSize: FontSize.h4,
    },
});

export default styles;
