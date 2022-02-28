import core from './core';
import { useSafeLiveOffers, useLiveOffers } from './hooks/useLiveOffers';
import { useLiveProtocol } from './hooks/useLiveProtocol';
import { useSafeLiveStake, useLiveStake } from './hooks/useLiveStake';
import { useLiveNugg } from './hooks/useLiveNugg';
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
    useLiveNugg,
    useLiveProtocol,
};
