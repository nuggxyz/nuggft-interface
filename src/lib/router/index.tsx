import React from 'react';
import {
    matchRoutes,
    RouteMatch,
    RouteObject,
    UNSAFE_RouteContext,
    useInRouterContext,
    useLocation,
    useParams,
} from 'react-router-dom';
import invariant from 'tiny-invariant';

import useAnimateOverlay from '@src/hooks/useAnimateOverlay';

const RouteContext = UNSAFE_RouteContext;

const ZINDEX = '__ZINDEX';
const HIDDEN = '__HIDDEN';

export interface OverlayRouteObject extends RouteObject {
    children?: this[];
    overlay?: number;
}

export const useOverlayRouteStyle = () => {
    const params = useParams();

    return useAnimateOverlay(!params[HIDDEN], {
        zIndex: params[ZINDEX],
    });
};

export const useOverlayRouteStyleWithOverride = (shouldOverride: boolean, value = false) => {
    const params = useParams();

    return useAnimateOverlay(shouldOverride ? value : !params[HIDDEN], {
        zIndex: params[ZINDEX],
    });
};

export function useRoutes(
    routes: OverlayRouteObject[],
    // locationArg?: Partial<Location> | string,
): React.ReactElement | null {
    invariant(
        useInRouterContext(),
        // TODO: This error is probably because they somehow have 2 versions of the
        // router loaded. We can help them understand how to avoid that.
        `useRoutes() may be used only in the context of a <Router> component.`,
    );
    const { matches: parentMatches } = React.useContext(RouteContext);
    const routeMatch = parentMatches[parentMatches.length - 1];
    const parentParams = routeMatch ? routeMatch.params : {};
    // const parentPathname = routeMatch ? routeMatch.pathname : '/';
    const parentPathnameBase = routeMatch ? routeMatch.pathnameBase : '/';
    // const parentRoute = routeMatch && routeMatch.route;

    const location = useLocation();

    const pathname = location.pathname || '/';
    const remainingPathname =
        parentPathnameBase === '/' ? pathname : pathname.slice(parentPathnameBase.length) || '/';
    const matches = matchRoutes(routes, { pathname: remainingPathname });

    routes[0].children?.forEach((route) => {
        if (route.overlay === 0 || route.overlay !== undefined) {
            if (matches?.every((x) => x.route.path !== route.path)) {
                // route.path = '/*';
                matches.push({
                    params: { [ZINDEX]: String(route.overlay), [HIDDEN]: 'yessir' },
                    pathname: remainingPathname,
                    pathnameBase: parentPathnameBase,
                    route,
                });
            } else {
                matches?.forEach((x) => {
                    if (x.route.path === route.path) {
                        x = {
                            ...x,
                            params: {
                                [ZINDEX]: String(route.overlay),
                                [HIDDEN]: undefined,
                                ...x.params,
                            },
                        };
                    }
                });
            }
        }
    });

    matches?.filterInPlace((x) => x.route.element !== null);
    // console.log(parentMatches);

    return _renderMatches(
        matches &&
            matches.map((match) => ({
                ...match,
                params: { ...parentParams, ...match.params },
                pathname: joinPaths([parentPathnameBase, match.pathname]),
                pathnameBase:
                    match.pathnameBase === '/'
                        ? parentPathnameBase
                        : joinPaths([parentPathnameBase, match.pathnameBase]),
            })),
        parentMatches,
    );
}

const joinPaths = (paths: string[]): string => paths.join('/').replace(/\/\/+/g, '/');

const _renderMatches = (
    matches: RouteMatch[] | null,
    parentMatches: RouteMatch[] = [],
): React.ReactElement | null => {
    if (matches == null) return null;

    // eslint-disable-next-line react/destructuring-assignment
    const abc = matches.reduceRight((outlet, match, index) => {
        return (
            <RouteContext.Provider
                // eslint-disable-next-line react/no-children-prop
                children={match.route.element !== undefined ? match.route.element : outlet}
                // eslint-disable-next-line react/jsx-no-constructed-context-values
                value={{
                    outlet,
                    // eslint-disable-next-line react/destructuring-assignment
                    matches: parentMatches.concat(matches.slice(0, index + 1)),
                }}
            />
        );
    }, null as React.ReactElement | null);

    return abc;
};
