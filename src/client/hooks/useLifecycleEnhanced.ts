import lib from '@src/lib';
import useLifecycle from '@src/client/hooks/useLifecycle';
import { Lifecycle } from '@src/client/interfaces';
import { SwapData } from '@src/client/swaps';

import client from '..';

export default (swap: SwapData | undefined) => {
    const lifecycle = useLifecycle(swap);

    const epoch = client.live.epoch.endblock();
    const blocknum = client.live.blocknum();

    if (!epoch || !blocknum || !swap) return undefined;

    switch (lifecycle) {
        case Lifecycle.Bat:
        case Lifecycle.Bunt:
            if (swap.epoch && swap.epoch.endblock - blocknum < (60 / 12) * 10)
                return { color: lib.colors.red, label: 'auction ending soon', lifecycle };
            return { color: lib.colors.green, label: 'live auction', lifecycle };

        case Lifecycle.Cut:
            return { color: lib.colors.primaryColor, label: 'auction just ended', lifecycle };
        case Lifecycle.Stands:
            return { color: lib.colors.primaryColor, label: 'staked', lifecycle };
        case Lifecycle.Bench:
            return { color: lib.colors.nuggGold, label: 'waiting on bid', lifecycle };
        case Lifecycle.Egg:
            return { color: lib.colors.orange, label: 'auction about to start', lifecycle };
        case Lifecycle.Deck:
            return { color: lib.colors.green, label: 'auction just started', lifecycle };
        default:
            return undefined;
    }
};
