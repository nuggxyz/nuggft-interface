import core from './core';
import { useSafeLiveOffers, useLiveOffers } from './hooks/useLiveOffers';
import { useSafeLiveStake, useLiveStake } from './hooks/useLiveStake';
import updater from './updater';

export default {
    core,
    useApollo: () => core.store((state) => state.apollo),
    useInfura: () => core.store((state) => state.infura),
    updater,
    getApollo: () => core.store.getState().apollo,
    getInfura: () => core.store.getState().infura,
    useSafeLiveOffers,
    useLiveOffers,
    useSafeLiveStake,
    useLiveStake,
};
