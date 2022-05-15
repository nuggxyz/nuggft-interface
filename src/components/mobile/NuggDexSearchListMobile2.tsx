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

import NuggListRenderItemMobile, { NuggListRenderItemMobileBig } from './NuggListRenderItemMobile';

const INFINITE_INTERVAL = 25;
const START_INTERVAL = 3;

const AllNuggs = ({ back }: { back: () => void }) => {
    const [allNuggsData, setAllNuggsData] = React.useState<GetAllNuggsSearchQuery['nuggs']>();

    const { fetchMore: fetchMoreNuggs } = useGetAllNuggsSearchQuery({
        fetchPolicy: 'cache-first',
        variables: {
            skip: 0,
            first: START_INTERVAL,
            orderBy: Nugg_OrderBy.Idnum,
        },
        onCompleted: (x) => {
            setAllNuggsData(x.nuggs);
        },
    });

    const loadMoreNuggs = React.useCallback(() => {
        void fetchMoreNuggs({
            variables: {
                first: INFINITE_INTERVAL,
                skip: allNuggsData?.length || 0,
            },
        }).then((x) => {
            setAllNuggsData((a) => [...(a || []), ...x.data.nuggs]);
        });
    }, [allNuggsData, fetchMoreNuggs, setAllNuggsData]);
    const id = React.useId();
    const reff = React.useRef(null);
    return (
        <div
            ref={reff}
            style={{
                height: '100%',
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
                        onClick={back}
                        buttonStyle={{
                            // position: 'absolute',
                            // top: 80,
                            WebkitBackdropFilter: 'blur(30px)',
                            left: '1.4rem',
                            zIndex: 1000,
                            borderRadius: lib.layout.borderRadius.large,
                            background: lib.colors.primaryColor,
                        }}
                        textStyle={{ color: 'white' }}
                    />
                ))}
                data={allNuggsData?.map((x) => x.id.toNuggId()) || []}
                RenderItemSmall={NuggListRenderItemMobile}
                RenderItemBig={NuggListRenderItemMobileBig}
                interval={25}
                disableScroll
                // useBradRef
                coreRef={reff}
                onScrollEnd={loadMoreNuggs}
                extraData={{ cardType: 'swap' }}
                itemHeightBig={340}
                itemHeightSmall={160}
                startGap={25}
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

const AllItems = ({ back }: { back: () => void }) => {
    const [allItemsData, setAllItemsData] = React.useState<ItemId[]>([]);

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
                height: '100%',
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
                        onClick={back}
                        buttonStyle={{
                            // position: 'absolute',
                            // top: 80,
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
                interval={25}
                disableScroll
                // useBradRef
                coreRef={reff}
                onScrollEnd={loadMoreItems}
                extraData={{ cardType: 'swap' }}
                itemHeightBig={340}
                itemHeightSmall={160}
                startGap={25}
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

const NuggDexSearchListMobile2 = ({
    page,
    setPage,
}: {
    page: 'search' | 'home' | 'all nuggs' | 'all items';
    setPage: (input: 'search' | 'home' | 'all nuggs' | 'all items') => void;
}) => {
    return page === 'home' ? (
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
                onClick={() => setPage('all nuggs')}
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
                onClick={() => setPage('all items')}
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
    ) : page === 'all nuggs' ? (
        <AllNuggs back={() => setPage('home')} />
    ) : (
        <AllItems back={() => setPage('home')} />
    );
};

export default NuggDexSearchListMobile2;
