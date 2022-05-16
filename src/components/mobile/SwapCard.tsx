import React from 'react';

import useMobileViewingNugg from '@src/client/hooks/useMobileViewingNugg';
import { InfiniteListRenderItemProps } from '@src/components/general/List/InfiniteList';

import MobileRingAbout from './MobileRingAbout';

const SwapCard = ({
    item: tokenId,
}: InfiniteListRenderItemProps<TokenId, undefined, undefined>) => {
    const { goto } = useMobileViewingNugg();

    // const [, startTransition] = React.useTransition();

    return (
        <div
            role="button"
            aria-hidden="true"
            className="mobile-pressable-div"
            style={{
                width: '100%',
                paddingBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                position: 'relative',
                height: '451px',
            }}
            onClick={(event) => {
                event.stopPropagation();
                goto(tokenId);
            }}
        >
            <MobileRingAbout tokenId={tokenId} />
        </div>
    );
};

export default SwapCard;
