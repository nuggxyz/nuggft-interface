import React from 'react';

import useSortedSwapList from '@src/client/hooks/useSortedSwapList';
import GodList from '@src/components/general/List/GodList';
import usePrevious from '@src/hooks/usePrevious';
import MobileRingAbout from '@src/components/mobile/MobileRingAbout';

const MobileSwapPage = () => {
    const sortedAll = useSortedSwapList();

    const prevSortedAll = usePrevious(sortedAll);

    const [dat, setDat] = React.useState(
        [sortedAll.current, sortedAll.next, sortedAll.potential].flat(),
    );

    React.useEffect(() => {
        if (
            !prevSortedAll ||
            sortedAll.current !== prevSortedAll.current ||
            sortedAll.next !== prevSortedAll.next ||
            sortedAll.potential !== prevSortedAll.potential
        ) {
            setDat([sortedAll.current, sortedAll.next, sortedAll.potential].flat());
        }
    }, [sortedAll, prevSortedAll]);

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
                zIndex: 0,
            }}
        >
            <GodList
                RenderItem={MobileRingAbout}
                data={dat}
                extraData={undefined}
                itemHeight={415}
                LIST_PADDING={0}
                skipSelectedCheck
                mobileFluid
                // faded
            />
        </div>
    );
};

export default MobileSwapPage;
