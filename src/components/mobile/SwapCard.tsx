import React from 'react';
import { animated, useSpring } from '@react-spring/web';

import useViewingNugg from '@src/client/hooks/useViewingNugg';

import MobileRingAbout from './MobileRingAbout';

const SwapCard = ({
    ref,
    tokenId,
}: // deselect,
{
    tokenId: TokenId;
    ref?: React.RefObject<HTMLDivElement>;
    asHappyTab?: boolean;
}) => {
    const [state, toggle] = React.useState(true);

    const [{ x }] = useSpring(
        {
            from: { x: 0 },
            x: state ? 1 : 0,
            reset: true,
            config: { duration: 200 },
        },
        [state],
    );

    const { gotoViewingNugg } = useViewingNugg();

    const [, startTransition] = React.useTransition();

    return (
        <animated.div
            ref={ref || null}
            style={{
                scale: x.to({
                    range: [0, 0.5, 1],
                    output: [0.93, 0.93, 1],
                }),
                width: '100%',
                paddingBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                position: 'relative',
            }}
            onClickCapture={() => {
                toggle(true);
            }}
            // onTouchEnd={(event) => {
            //     event.stopPropagation();
            //     if (tokenId) {
            //         startTransition(() => {
            //             x.reset();
            //             gotoViewingNugg(tokenId || '');
            //         });
            //     }
            // }}
            onClick={(event) => {
                x.reset();

                event.stopPropagation();
                toggle(true);
                if (tokenId) {
                    startTransition(() => {
                        x.reset();
                        gotoViewingNugg(tokenId);
                    });
                }
            }}
        >
            <MobileRingAbout tokenId={tokenId} />
        </animated.div>
    );
};

export default SwapCard;
