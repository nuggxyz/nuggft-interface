import { NLStyleSheetCreator } from '@src/lib';
import Layout from '@src/lib/layout';

const styles = NLStyleSheetCreator({
    textStyle: {
        fontFamily: Layout.font.code.regular,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default styles;
