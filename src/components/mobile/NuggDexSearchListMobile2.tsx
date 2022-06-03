import React from 'react';

import {
    GetAllNuggsSearchQuery,
    Item_OrderBy,
    Nugg_OrderBy,
    useGetAllItemsSearchQuery,
    useGetAllNuggsSearchQuery,
} from '@src/gql/types.generated';
import lib from '@src/lib';
import BradPittList from '@src/components/general/List/BradPittList';
import Button from '@src/components/general/Buttons/Button/Button';
import client from '@src/client';
import { Page } from '@src/interfaces/nuggbook';

import { NuggListRenderItemMobileBig, NuggListRenderItemMobile } from './NuggListRenderItemMobile';

const INFINITE_INTERVAL = 500;
const START_INTERVAL = 1000;

export const AllNuggs = () => {
    const goto = client.nuggbook.useGoto();

    const page = client.nuggbook.useNuggBookPage();

    const [allNuggsData, setAllNuggsData] = React.useState<GetAllNuggsSearchQuery['nuggs']>();
    const [go, setGo] = React.useState(false);
    const { fetchMore: fetchMoreNuggs } = useGetAllNuggsSearchQuery({
        fetchPolicy: 'cache-first',
        skip: true,
        variables: {
            skip: 0,
            first: START_INTERVAL,
            orderBy: Nugg_OrderBy.Idnum,
        },
    });

    const loadMoreNuggs = React.useCallback(async () => {
        let started = false;
        let added = 0;
        const allll = [] as NonNullable<typeof allNuggsData>;
        let res = [] as NonNullable<typeof allNuggsData>;
        while (!started || res.length === START_INTERVAL) {
            started = true;
            // eslint-disable-next-line no-await-in-loop
            res = await fetchMoreNuggs({
                variables: {
                    first: START_INTERVAL,
                    skip: added,
                },
            }).then((x) => {
                return x.data.nuggs;
            });

            added += res.length;

            allll.push(...res);
        }
        return allll;
        // setAllNuggsData(allll);
    }, [fetchMoreNuggs]);

    React.useEffect(() => {
        let stale = false;
        if (page === Page.AllNuggs && !go) {
            setGo(true);
            void loadMoreNuggs().then((data) => {
                if (!stale) {
                    setAllNuggsData(data);
                }
            });
        }
        return () => {
            stale = true;
        };
    }, [loadMoreNuggs, setGo, page, go]);

    // console.log('ayo', allNuggsData?.length);

    const id = React.useId();
    const reff = React.useRef(null);
    return (
        <div
            ref={reff}
            style={{
                overflow: 'scroll',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                height: '600px',
            }}
        >
            <BradPittList
                id={`${id}-of-brad`}
                listStyle={{
                    overflow: 'hidden',
                    position: 'relative',
                    justifyContent: 'flex-start',
                    // padding: '0 20px',
                    height: '100%',
                    width: '100%',
                }}
                headerStyle={{
                    marginTop: 20,
                }}
                style={{
                    width: '100%',
                }}
                Title={React.memo(() => (
                    <Button
                        label="back"
                        onClick={() => goto(Page.Search, false)}
                        buttonStyle={{
                            // position: 'absolute',
                            // top: 80,
                            backdropFilter: 'blur(30px)',
                            WebkitBackdropFilter: 'blur(30px)',
                            left: '1.4rem',
                            zIndex: 1000,
                            borderRadius: lib.layout.borderRadius.large,
                            background: lib.colors.primaryColor,
                        }}
                        textStyle={{ color: 'white' }}
                    />
                ))}
                offsetListRef={false}
                data={allNuggsData?.map((x) => x.id.toNuggId()) || []}
                RenderItemSmall={NuggListRenderItemMobile}
                RenderItemBig={NuggListRenderItemMobileBig}
                disableScroll
                // useBradRef
                coreRef={reff}
                // onScrollEnd={loadMoreNuggs}
                extraData={{ cardType: 'swap' }}
                itemHeightBig={340}
                itemHeightSmall={160}
                startGap={25}
                endGap={100}
                // floaterWrapperStyle={{
                //     position: 'absolute',
                //     top: 83,
                //     right: '1rem',
                // }}
                floaterColor={lib.colors.transparentWhite}
            />
        </div>
    );
};

export const AllItems = () => {
    const [allItemsData, setAllItemsData] = React.useState<ItemId[]>([]);
    const goto = client.nuggbook.useGoto();

    const { fetchMore: fetchMoreItems } = useGetAllItemsSearchQuery({
        fetchPolicy: 'cache-first',
        variables: {
            skip: 0,
            first: START_INTERVAL,
            orderBy: Item_OrderBy.Idnum,
        },
        onCompleted: (x) => {
            setAllItemsData(x.items.map((y) => y.id.toItemId()));
        },
    });

    const loadMoreItems = React.useCallback(() => {
        void fetchMoreItems({
            variables: {
                first: INFINITE_INTERVAL,
                skip: allItemsData?.length || 0,
            },
        }).then((x) => {
            setAllItemsData([...allItemsData, ...x.data.items.map((y) => y.id.toItemId())]);
        });
    }, [allItemsData, fetchMoreItems, setAllItemsData]);

    const id = React.useId();
    const reff = React.useRef(null);
    return (
        <div
            ref={reff}
            style={{
                overflow: 'scroll',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <BradPittList
                id={`${id}-of-brad`}
                listStyle={{
                    overflow: undefined,
                    position: 'relative',
                    justifyContent: 'flex-start',
                    // padding: '0 20px',
                    width: '100%',
                }}
                headerStyle={{
                    marginTop: 20,
                }}
                style={{
                    width: '100%',
                }}
                Title={React.memo(() => (
                    <Button
                        label="back"
                        onClick={() => goto(Page.Search, false)}
                        buttonStyle={{
                            // position: 'absolute',
                            // top: 80,
                            backdropFilter: 'blur(30px)',

                            WebkitBackdropFilter: 'blur(30px)',
                            zIndex: 1000,
                            borderRadius: lib.layout.borderRadius.large,
                            background: lib.colors.primaryColor,
                        }}
                        textStyle={{ color: 'white' }}
                    />
                ))}
                data={allItemsData}
                RenderItemSmall={NuggListRenderItemMobile}
                RenderItemBig={NuggListRenderItemMobileBig}
                disableScroll
                // useBradRef
                coreRef={reff}
                onScrollEnd={loadMoreItems}
                extraData={{ cardType: 'swap' }}
                itemHeightBig={340}
                itemHeightSmall={160}
                startGap={25}
                endGap={100}
                floaterWrapperStyle={
                    {
                        // position: 'absolute',
                        // top: 83,
                        // right: '1rem',
                    }
                }
                floaterColor={lib.colors.transparentWhite}
            />
        </div>
    );
};

// const NuggList = React.lazy(() => import('./components/NuggList'));

const NuggDexSearchListMobile2 = () => {
    const goto = client.nuggbook.useGoto();
    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Button
                label="View All Nuggs"
                onClick={() => goto(Page.AllNuggs, true)}
                buttonStyle={{
                    borderRadius: lib.layout.borderRadius.large,
                    background: lib.colors.primaryColor,
                    marginRight: '10px',
                    marginBottom: '20px',
                }}
                textStyle={{
                    color: lib.colors.white,
                    fontSize: 24,
                }}
            />
            <Button
                label="View All Items"
                onClick={() => goto(Page.AllItems, true)}
                buttonStyle={{
                    borderRadius: lib.layout.borderRadius.large,
                    background: lib.colors.primaryColor,
                    marginRight: '10px',
                }}
                textStyle={{
                    color: lib.colors.white,
                    fontSize: 24,
                }}
            />
        </div>
    );
};

export default NuggDexSearchListMobile2;
