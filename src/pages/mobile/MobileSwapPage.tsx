import React from 'react';

import SwapCard from '@src/components/mobile/SwapCard';
import useSortedSwapList from '@src/client/hooks/useSortedSwapList';
import GodList from '@src/components/general/List/GodList';

const SwapView = () => {
    const sortedAll = useSortedSwapList();

    // React.useEffect(() => {
    //     setTimeout(() => {
    //         setRest(true);
    //     }, 3000);
    // }, []);

    // console.log({ sortedAll });

    // const { height } = useDimensions();

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

            <GodList
                RenderItem={SwapCard}
                data={[sortedAll.current, sortedAll.next, sortedAll.potential].flat()}
                extraData={undefined}
                itemHeight={475}
                startGap={75}
                // screenHeight={height}
                LIST_PADDING={0}
                skipSelectedCheck
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
