// eslint-disable-next-line no-shadow
export enum Route {
    SwapItem,
    ViewItem,
    ViewNugg,
    SwapNugg,
    Home,
}

// eslint-disable-next-line no-shadow
export enum Feature {
    Base,
    Eyes,
    Mouth,
    Hair,
    Hat,
    Back,
    Hold,
    Neck,
}

interface BaseRoute {
    type: Route;
}
export type ViewRoute = Route.ViewItem | Route.ViewNugg;
export type SwapRoute = Route.SwapItem | Route.SwapNugg;
export type ItemId = `item-${string | number}`;
export type NuggId = string;
export type TokenId = ItemId | NuggId;

interface ItemData {
    tokenId: ItemId;
    feature: Feature;
    position: number;
}

interface NuggData {
    tokenId: string;
    idnum: number;
}

export interface HomeRoute extends BaseRoute {
    type: Route.Home;
}

export interface SwapItemRoute extends BaseRoute, ItemData {
    type: Route.SwapItem;
}
export interface SwapNuggRoute extends BaseRoute, NuggData {
    type: Route.SwapNugg;
    tokenId: NuggId;
    idnum: number;
}

export interface ViewNuggRoute extends BaseRoute, NuggData {
    type: Route.ViewNugg;
    tokenId: NuggId;
}

export interface ViewItemRoute extends BaseRoute, ItemData {
    type: Route.ViewItem;
    tokenId: ItemId;
}

export type ViewRoutes = ViewItemRoute | ViewNuggRoute;
export type SwapRoutes = SwapItemRoute | SwapNuggRoute;
export type NonHomeRoutes = ViewRoutes | SwapRoutes;

export type Routes = SwapRoutes | HomeRoute | ViewRoutes;

export const NuggRegex = /\/nugg\/(\d+)/;
export const ItemRegex = /\/item\/(\d)\/(\d+)/;
export const ViewRegex = /#\/view\//;

export function parseRoute(route: string): Routes {
    if (route === '#/') return { type: Route.Home };

    const view = ViewRegex.test(route);

    if (NuggRegex.test(route)) {
        const arr = NuggRegex.exec(route);
        const tokenId: NuggId = arr![1];
        return { type: view ? Route.ViewNugg : Route.SwapNugg, tokenId, idnum: +tokenId };
    }

    if (ItemRegex.test(route)) {
        const arr = ItemRegex.exec(route);
        const feature = +arr![1];
        const position = +arr![2];
        const tokenId: ItemId = `item-${((feature << 8) | position).toString()}`;
        return { type: view ? Route.ViewItem : Route.SwapItem, tokenId, feature, position };
    }

    window.location.href = '#/';

    return { type: Route.Home };
}

// export const useRouter = () => {
//     const route = client.live.route();
//     const lastSwap = client.live.lastSwap();
//     const lastView = client.live.lastView();
//     const lastSwap__tokenId = client.live.lastSwap__tokenId();
//     const lastView__tokenId = client.live.lastView__tokenId();
//     const isViewOpen = client.live.isViewOpen();

//     const toggleView = client.actions.toggleView;
//     const routeTo = client.actions.routeTo;

//     return {
//         route,
//         lastSwap,
//         lastView,
//         isViewOpen,
//         toggleView,
//         routeTo,
//         lastSwap__tokenId,
//         lastView__tokenId,
//     };
// };

export default { parseRoute };
