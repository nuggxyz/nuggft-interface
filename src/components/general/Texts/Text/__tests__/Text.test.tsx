import React from 'react';
import { cleanup, render } from '@testing-library/react';

import Text from '@src/components/general/Texts/Text/Text';

// Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
// unmount and cleanup DOM after the test is finished.
afterEach(cleanup);

it('Text renders as expected', () => {
    const { baseElement } = render(<Text>sup</Text>);

    expect(baseElement.innerHTML).toBe(
        '<div><div style="user-select: none; font-family: SFProRounded-Bold; font-weight: normal; font-size: 18px;">sup</div></div>',
    );
});
