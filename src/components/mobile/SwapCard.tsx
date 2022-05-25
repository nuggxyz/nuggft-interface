import React from 'react';
import { useNavigate } from 'react-router';

import { GodListRenderItemProps } from '@src/components/general/List/GodList';

const SwapCard = ({
    item: tokenId,
}: // visible,
GodListRenderItemProps<TokenId, undefined, undefined>) => {
    const navigate = useNavigate();

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
                height: '500px',
            }}
            onClick={(event) => {
                event.stopPropagation();
                navigate(`/swap/${tokenId}`);
            }}
        >
            {/* <MobileRingAbout tokenId={tokenId} visible={!!visible} /> */}
        </div>
    );
};

export default SwapCard;
