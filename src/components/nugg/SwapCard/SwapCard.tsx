/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

import { SwapData } from '@src/client/interfaces';
import useLiveToken from '@src/client/subscriptions/useLiveToken';
import RingAbout from '@src/components/nugg/RingAbout/RingAbout';
import useLiveOffers from '@src/client/subscriptions/useLiveOffers';

export default ({
    item,
    selected,
    select,
    deselect,
}: // deselect,
{
    item: SwapData;
    selected: boolean;
    select: () => void;
    deselect?: () => void;
}) => {
    useLiveToken(item.tokenId);
    useLiveOffers(item.tokenId);

    return (
        <div
            style={{
                width: '100%',
                paddingBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                position: 'relative',
            }}
        >
            <RingAbout manualTokenId={item.id} />
        </div>
    );
};
