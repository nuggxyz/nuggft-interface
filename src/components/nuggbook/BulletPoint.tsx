import React, { FunctionComponent } from 'react';

import Text from '@src/components/general/Texts/Text/Text';

const BulletPoint: FunctionComponent<{ text: string; bullet?: string }> = ({
    text,
    bullet = '📍',
}) => (
    <div style={{ display: 'flex' }}>
        <Text textStyle={{ marginRight: '.3rem' }}>{bullet}</Text>
        <Text textStyle={{ marginBottom: '.75rem' }}>{text}</Text>
    </div>
);
export default BulletPoint;
