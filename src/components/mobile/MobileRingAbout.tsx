import React, { FunctionComponent } from 'react';
import { animated } from '@react-spring/web';
import { useNavigate } from 'react-router';

import client from '@src/client';
import lib from '@src/lib';
import { GodListRenderItemProps } from '@src/components/general/List/GodList';

import MobileOwnerBlock from './MobileOwnerBlock';

type Props = GodListRenderItemProps<TokenId, undefined, undefined>;

const MobileRingAbout: FunctionComponent<Props> = ({ item: tokenId, visible }) => {
    const navigate = useNavigate();

    const swap = client.v2.useSwap(tokenId);

    const background = React.useMemo(() => {
        return {
            ...(swap === undefined && {
                background: lib.colors.gradient4Transparent,
            }),
        };
    }, [swap]);

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
                height: '438px',
            }}
            onClick={(event) => {
                event.stopPropagation();
                if (tokenId) navigate(`/swap/${tokenId}`);
            }}
        >
            <animated.div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'visible',
                    borderRadius: lib.layout.borderRadius.medium,
                    background: lib.colors.gradient2Transparent,
                    padding: '.75rem',
                    position: 'relative',
                    ...background,
                    boxShadow: lib.layout.boxShadow.dark,
                    width: '93%',
                    height: '415px',
                }}
            >
                <MobileOwnerBlock tokenId={tokenId} visible={visible} />
            </animated.div>
        </div>
    );
};

export default MobileRingAbout;
