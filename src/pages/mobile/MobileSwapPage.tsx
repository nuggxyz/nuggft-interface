import React from 'react';

import SwapCard from '@src/components/mobile/SwapCard';
import InfiniteList from '@src/components/general/List/InfiniteList';
import useSortedSwapList from '@src/client/hooks/useSortedSwapList';

const SwapView = () => {
    const sortedAll = useSortedSwapList();

    // React.useEffect(() => {
    //     setTimeout(() => {
    //         setRest(true);
    //     }, 3000);
    // }, []);

    // console.log({ sortedAll });

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                width: '100%',
                // marginTop: '20px',
                marginBottom: '500px',
                alignItems: 'center',
                justifyContent: 'flex-start',
                overflow: 'scroll',
                WebkitOverflowScrolling: 'touch',
                zIndex: 0,
            }}
        >
            {/* <div style={{ marginTop: '100px' }} /> */}
            {/* <SwapCard
                tokenId={sortedAll.current[0]}
                key={`SwapCard-Current-${sortedAll.current[0]}`}
            /> */}

            <InfiniteList
                RenderItem={SwapCard}
                data={[sortedAll.current, sortedAll.next, sortedAll.potential].flat()}
                extraData={undefined}
                itemHeight={451}
                interval={5}
                startGap={100}
            />

            {/* {sortedAll.current.map((x) => (
                <SwapCard tokenId={x} key={`SwapCard-Current-${x}`} />
            ))}

            {sortedAll.next.map((x) => (
                <SwapCard tokenId={x} key={`SwapCard-Next-${x}`} />
            ))} */}

            {/* {sortedAll.potential.map((x) => (
                <SwapCard tokenId={x} key={`SwapCard-Potential-${x}`} />
            ))} */}
        </div>
    );
};

export default SwapView;
