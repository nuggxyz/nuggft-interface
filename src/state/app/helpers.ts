import {
    isUndefinedOrNullOrArrayEmpty,
    isUndefinedOrNullOrObjectEmpty,
    isUndefinedOrNullOrStringEmpty,
} from '../../lib';
import store from '../store';
import SwapDispatches from '../swap/dispatches';
import TokenDispatches from '../token/dispatches';

import AppDispatches from './dispatches';

const silentlySetRoute = (route: string) => {
    window.location.hash = route;
};

const onRouteUpdate = (route: string) => {
    try {
        const swapRoute = route.match(/\/(swap)\/(\d+)\-(\d+)/);
        const tokenRoute = route.match(/\/(nugg)\/(\d+)/);

        const soloTokenRoute = route.match(/\/(nugg)((?=\/)\/|.*)/);

        const currentView = store.getState().app.view;

        const currentEpoch = !isUndefinedOrNullOrObjectEmpty(
            store.getState().protocol.epoch,
        )
            ? store.getState().protocol.epoch.id
            : '';

        if (route === '/' && !isUndefinedOrNullOrStringEmpty(currentEpoch)) {
            SwapDispatches.initSwap({
                swapId: `${currentEpoch}-${currentEpoch}`,
            });
        } else if (
            !isUndefinedOrNullOrArrayEmpty(swapRoute) &&
            swapRoute.length === 4 &&
            swapRoute[1] === 'swap'
        ) {
            SwapDispatches.initSwap({
                swapId: `${swapRoute[2]}-${swapRoute[3]}`,
            });
            if (currentView !== 'Swap') {
                AppDispatches.changeView('Swap');
            }
        } else if (
            !isUndefinedOrNullOrArrayEmpty(tokenRoute) &&
            tokenRoute.length === 3 &&
            tokenRoute[1] === 'nugg'
        ) {
            if (!isUndefinedOrNullOrStringEmpty(currentEpoch)) {
                SwapDispatches.initSwap({
                    swapId: `${currentEpoch}-${currentEpoch}`,
                });
            }
            TokenDispatches.setTokenFromId(tokenRoute[2]);
            if (currentView !== 'Search') {
                AppDispatches.changeView('Search');
            }
        } else if (!isUndefinedOrNullOrArrayEmpty(soloTokenRoute)) {
            if (currentView !== 'Search') {
                AppDispatches.changeView('Search');
            }
        }
        AppHelpers.silentlySetRoute(route);
    } catch (error) {
        console.log(error);
    }
};

const AppHelpers = {
    silentlySetRoute,
    onRouteUpdate,
};

export default AppHelpers;
