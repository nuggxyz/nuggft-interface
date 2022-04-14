import React from 'react';

import client from '@src/client';
import { SwapData } from '@src/client/interfaces';
import { TokenId } from '@src/client/router';
import RingAbout from '@src/components/nugg/RingAbout/RingAbout';

const SwapView = () => {
    const activeNuggs = client.live.activeSwaps();
    const recentNuggs = client.live.recentSwaps();
    const activeItems = client.live.activeItems();
    const recentItems = client.live.recentItems();
    const epoch = client.live.epoch.id();
    const lastswap = client.live.lastSwap.tokenId();

    const all = React.useMemo(() => {
        return [...activeNuggs, ...activeItems, ...recentItems, ...recentNuggs].sort((a, b) =>
            a.eth.lt(b.eth) ? -1 : 1,
        );
    }, [activeNuggs, activeItems, recentItems, recentNuggs]);

    const sortedAll = React.useMemo(() => {
        return all.reduce(
            (
                prev: {
                    current: SwapData[];
                    next: SwapData[];
                    recent: SwapData[];
                },
                curr,
            ) => {
                if (epoch && curr.endingEpoch && curr.tokenId !== lastswap) {
                    if (curr.endingEpoch === epoch) {
                        prev.current.push(curr);
                    } else if (curr.endingEpoch === epoch + 1) {
                        prev.next.push(curr);
                    } else if (curr.endingEpoch < epoch) {
                        prev.recent.push(curr);
                    }
                }
                return prev;
            },
            { current: [], next: [], recent: [] },
        );
    }, [all, epoch, lastswap]);

    // const reff = React.useRef(null);
    // const reff2 = React.useRef(null);

    // const abc = useScrollPosition(reff);

    // console.log({ abc, reff2, reff });

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                marginBottom: '500px',
                alignItems: 'center',
                justifyContent: 'flex-start',
                overflow: 'scroll',
                WebkitOverflowScrolling: 'touch',
            }}
        >
            <div style={{ marginTop: '80px' }} />

            <SwapCard tokenId={lastswap} />

            {/* <Label
                textStyle={{ fontSize: '20px', padding: '5px', color: 'white' }}
                containerStyles={{
                    height: '50px',
                    margin: '30px',
                    background: lib.colors.gradient3Transparent,
                }}
                text={t`Ending in about ${plural(minutes, {
                    1: `${minutes} minute`,
                    other: `${minutes} minutes`,
                    0: 'less than 1 minute',
                })}`}
            /> */}

            {sortedAll.current.map((x) => (
                <SwapCard tokenId={x.tokenId} key={`SwapCard-Current-${x.tokenId}`} />
            ))}
            {/* <Label
                textStyle={{ fontSize: '20px', padding: '5px', color: 'white' }}
                containerStyles={{
                    height: '50px',
                    margin: '30px',
                    background: lib.colors.gradient3Transparent,
                }}
                text={t`Coming up`}
            /> */}
            {sortedAll.next.map((x) => (
                <SwapCard tokenId={x.tokenId} key={`SwapCard-Next-${x.tokenId}`} />
            ))}
        </div>
    );
};

const SwapCard = ({
    ref,
    tokenId,
}: // deselect,
{
    tokenId?: TokenId;
    ref?: React.RefObject<HTMLDivElement>;
}) => {
    return (
        <div
            ref={ref || null}
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
            <RingAbout manualTokenId={tokenId} />
        </div>
    );
};

export default SwapView;
