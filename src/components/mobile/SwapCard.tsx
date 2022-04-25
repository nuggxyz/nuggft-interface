import React from 'react';

import useMobileViewingNugg from '@src/client/hooks/useMobileViewingNugg';

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
    // const [{ x }] = useSpring(
    //     {
    //         from: { x: 0 },
    //         x: state ? 1 : 0,
    //         reset: true,
    //         config: { duration: 200 },
    //     },
    //     [state],
    // );

    const { goto } = useMobileViewingNugg();

    // const [, startTransition] = React.useTransition();

    return (
        <div
            role="button"
            aria-hidden="true"
            className="mobile-pressable-div"
            ref={ref || null}
            style={{
                // scale: x.to({
                //     range: [0, 0.5, 1],
                //     output: [0.93, 0.93, 1],
                // }),
                width: '100%',
                paddingBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                position: 'relative',
            }}
            onClick={(event) => {
                // x.reset();

                event.stopPropagation();
                // toggle(true);
                // if (tokenId) {
                //     startTransition(() => {
                //         x.reset();
                goto(tokenId);
                //     });
                // }
            }}
        >
            <MobileRingAbout tokenId={tokenId} />
        </div>
    );
};

export default SwapCard;
