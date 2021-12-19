import { NLStyleSheetCreator } from '../../../lib';
import FontSize from '../../../lib/fontSize';
import Layout from '../../../lib/layout';

const styles = NLStyleSheetCreator({
    value: {
        fontFamily: Layout.font.code.regular,
        marginLeft: '.5rem',
        fontSize: FontSize.h4,
    },
});

export default styles;
