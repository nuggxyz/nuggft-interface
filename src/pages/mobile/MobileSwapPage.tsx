import React from 'react';
import { animated } from '@react-spring/web';

import useSortedSwapList from '@src/client/hooks/useSortedSwapList';
import GodList from '@src/components/general/List/GodList';
import usePrevious from '@src/hooks/usePrevious';
import MobileRingAbout from '@src/components/mobile/MobileRingAbout';

// const fast = { mass: 5, tension: 1200, friction: 40 };
// const slow = { mass: 10, tension: 200, friction: 200 };
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
        <animated.div
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
            />
        </animated.div>
    );
};

export default MobileSwapPage;
