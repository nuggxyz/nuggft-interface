import React from 'react';

import {
    GetAllItemsQuery,
    GetAllNuggsQuery,
    Item_OrderBy,
    Nugg_OrderBy,
    useGetAllItemsQuery,
    useGetAllNuggsQuery,
} from '@src/gql/types.generated';
import lib from '@src/lib';
import BradPittList from '@src/components/general/List/BradPittList';
import Button from '@src/components/general/Buttons/Button/Button';
import client from '@src/client';
import { Page } from '@src/interfaces/nuggbook';

import { NuggListRenderItemMobileBig, NuggListRenderItemMobile } from './NuggListRenderItemMobile';

const INFINITE_INTERVAL = 100;
// const START_INTERVAL = 1000;

export const AllNuggs = () => {
    const goto = client.nuggbook.useGoto();

    const [allNuggsData, setAllNuggsData] = React.useState<GetAllNuggsQuery['nuggs']>();

    const { fetchMore: fetchMoreNuggs } = useGetAllNuggsQuery({
        fetchPolicy: 'cache-first',
        variables: {
            skip: 0,
            first: INFINITE_INTERVAL,
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
                coreRef={reff}
                onScrollEnd={loadMoreNuggs}
                extraData={{ cardType: 'swap' }}
                itemHeightBig={340}
                itemHeightSmall={160}
                startGap={25}
                endGap={100}
                floaterColor={lib.colors.transparentWhite}
            />
        </div>
    );
};

export const AllItems = () => {
    const [allItemsData, setAllItemsData] = React.useState<GetAllItemsQuery['items']>();
    const goto = client.nuggbook.useGoto();

    const { fetchMore: fetchMoreItems } = useGetAllItemsQuery({
        fetchPolicy: 'cache-first',
        variables: {
            skip: 0,
            first: INFINITE_INTERVAL,
            orderBy: Item_OrderBy.Idnum,
        },
        onCompleted: (x) => {
            setAllItemsData(x.items);
        },
    });

    const loadMoreItems = React.useCallback(() => {
        void fetchMoreItems({
            variables: {
                first: INFINITE_INTERVAL,
                skip: allItemsData?.length || 0,
            },
        }).then((x) => {
            setAllItemsData((a) => [...(a || []), ...x.data.items]);
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
                data={allItemsData?.map((x) => x.id.toItemId()) || []}
                RenderItemSmall={NuggListRenderItemMobile}
                RenderItemBig={NuggListRenderItemMobileBig}
                disableScroll
                coreRef={reff}
                onScrollEnd={loadMoreItems}
                extraData={{ cardType: 'swap' }}
                itemHeightBig={340}
                itemHeightSmall={160}
                startGap={25}
                endGap={100}
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
