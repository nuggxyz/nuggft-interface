import { animated, useSpring } from '@react-spring/web';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { CornerRightDown, CornerRightUp, Search, X } from 'react-feather';
import { t } from '@lingui/macro';
import { useMatch, useNavigate } from 'react-router-dom';

import useDebounce from '@src/hooks/useDebounce';
import usePrevious from '@src/hooks/usePrevious';
import Colors from '@src/lib/colors';
import Button from '@src/components/general/Buttons/Button/Button';
import TextInput from '@src/components/general/TextInputs/TextInput/TextInput';
import Text from '@src/components/general/Texts/Text/Text';
import client from '@src/client';
import { ListData, SearchView } from '@src/client/interfaces';
import {
    GetAllItemsQuery,
    GetAllNuggsQuery,
    Nugg_OrderBy,
    useGetAllItemsQuery,
    useGetAllNuggsQuery,
    Item_OrderBy,
} from '@src/gql/types.generated';
import { ItemId } from '@src/client/router';
import TokenViewer from '@src/components/nugg/TokenViewer';
import lib, {
    extractItemId,
    isUndefinedOrNullOrStringEmpty,
    parseTokenIdSmart,
} from '@src/lib/index';
import useOnClickOutside from '@src/hooks/useOnClickOutside';
import globalStyles from '@src/lib/globalStyles';

import styles from './NuggDexSearchBar.styles';

enum FilterEnum {
    NuggsThatOwnThisItem,
    BunchOfNuggs,
}

export interface FilterBase {
    type: FilterEnum;
    only: 'nuggs' | 'items' | 'both';
}

export interface NuggsThatOwnThisItemFilter extends FilterBase {
    type: FilterEnum.NuggsThatOwnThisItem;
    only: 'nuggs';
    itemId: ItemId;
}
export interface BunchOfNuggsFilter extends FilterBase {
    type: FilterEnum.NuggsThatOwnThisItem;
    only: 'nuggs';
    start: number;
    size: number;
}
export interface BunchOfItemsFilter extends FilterBase {
    type: FilterEnum.NuggsThatOwnThisItem;
    only: 'items';
    feauture: number;
}
export type Filter = NuggsThatOwnThisItemFilter;

type Props = Record<string, never>;

const NuggDexSearchBar: FunctionComponent<Props> = () => {
    const viewing = client.live.searchFilter.viewing();

    const isViewOpen = useMatch('view/*');
    const sort = client.live.searchFilter.sort();
    const searchValue = client.live.searchFilter.searchValue();

    const prevSearchValue = usePrevious(searchValue);
    const [localSearchValue, setSearchValue] = useState('');
    const [isUserInput, setIsUserInput] = useState(false);
    const updateSearchFilterSearchValue = client.mutate.updateSearchFilterSearchValue();
    const updateSearchFilterSort = client.mutate.updateSearchFilterSort();
    const updateSearchFilterViewing = client.mutate.updateSearchFilterViewing();

    const debouncedValue = useDebounce(localSearchValue, 100);
    const [sortAsc, setSortAsc] = useState(sort && sort.direction === 'asc');

    const [activeFilter, setActiveFilter] = React.useState<Filter>();
    const [show, setShow] = React.useState<boolean>(false);
    const navigate = useNavigate();
    // const location = useLocation();

    useEffect(() => {
        if (isViewOpen) {
            updateSearchFilterSearchValue(debouncedValue);
        } else {
            setSearchValue('');
        }
    }, [debouncedValue, isViewOpen, updateSearchFilterSearchValue]);

    useEffect(() => {
        if (sort) {
            if (sortAsc && (sort.direction === 'asc') !== sortAsc && isUserInput) {
                setIsUserInput(false);
                updateSearchFilterSort({
                    by: 'id',
                    direction: 'asc',
                });
            } else {
                setSortAsc(sort.direction === 'asc');
            }
        }
    }, [sortAsc, sort, isUserInput, updateSearchFilterSort]);

    useEffect(() => {
        if (localSearchValue === '' && prevSearchValue && prevSearchValue !== localSearchValue) {
            setSearchValue('');
        }
    }, [localSearchValue, prevSearchValue]);

    const styleInput = useSpring({
        width: isViewOpen ? '100%' : '0%',
    });
    const style = useSpring({
        ...styles.searchBar,
        margin: isViewOpen ? '0% 5% 0% 5%' : '0% 100% 0% 0%',
    });
    const animatedBR = useSpring({
        borderRadius: isViewOpen ? '7px' : '20px',
    });

    const [searchedNuggsData, setSearchedNuggsData] = React.useState<GetAllNuggsQuery['nuggs']>();
    const [searchedItemsData, setSearchedItemsData] = React.useState<GetAllItemsQuery['items']>();

    const { fetchMore: getAllNuggs } = useGetAllNuggsQuery({
        fetchPolicy: 'network-only',
    });

    const { fetchMore: getAllItems } = useGetAllItemsQuery({
        fetchPolicy: 'network-only',
    });

    const blankItemQuery = React.useCallback(() => {
        setSearchedItemsData(undefined);
    }, [setSearchedItemsData]);

    const blankNuggQuery = React.useCallback(() => {
        setSearchedNuggsData(undefined);
    }, [setSearchedNuggsData]);

    useEffect(() => {
        if (!isUndefinedOrNullOrStringEmpty(searchValue)) {
            setShow(true);
        }
    }, [setShow, searchValue]);

    useEffect(() => {
        if (debouncedValue && debouncedValue !== '') {
            void getAllItems({
                variables: {
                    orderBy: Item_OrderBy.Idnum,
                    where: {
                        position: debouncedValue,
                    },
                },
            }).then((x) => {
                setSearchedItemsData(x.data.items);
            });

            void getAllNuggs({
                variables: {
                    orderBy: Nugg_OrderBy.Idnum,

                    where: {
                        id: debouncedValue,
                    },
                },
            }).then((x) => {
                setSearchedNuggsData(x.data.nuggs);
            });
        }
    }, [debouncedValue, getAllNuggs, getAllItems, setSearchedNuggsData, setSearchedItemsData]);

    useEffect(() => {
        switch (activeFilter?.type) {
            case FilterEnum.NuggsThatOwnThisItem: {
                void getAllNuggs({
                    variables: {
                        where: {
                            _items_contains_nocase: [+extractItemId(activeFilter.itemId)],
                        },
                    },
                }).then((x) => {
                    setActiveSearch([
                        ...(x.data.nuggs.map((y) => ({
                            id: y.id,
                            listDataType: 'basic' as const,
                        })) || []),
                    ]);
                });
                void blankItemQuery();
                break;
            }
            case undefined:
            default: {
                break;
            }
        }
    }, [activeFilter, getAllItems, getAllNuggs, blankItemQuery]);

    const setActiveSearch = client.mutate.setActiveSearch();

    const ref = React.useRef(null);
    useOnClickOutside(ref, () => setShow(false));

    const agg = React.useMemo(() => {
        return [
            ...(searchedNuggsData ?? []).map((x) => ({
                id: x.id,
                listDataType: 'basic' as const,
            })),
            ...(searchedItemsData ?? []).map((x) => ({
                id: `item-${x.id}`,
                listDataType: 'basic' as const,
            })),
        ] as ListData[];
    }, [searchedNuggsData, searchedItemsData]);

    const resultStyle = useSpring({
        position: 'absolute' as const,
        width: show ? '103%' : '100%',
        maxHeight: show ? (agg.length === 0 ? '230%' : '1000%') : '0%',
        top: show ? '-9px' : '0px',
        // left: -10,
        background: lib.colors.semiTransparentWhite,
        // padding: '100px',
        borderRadius: lib.layout.borderRadius.mediumish,
        paddingTop: '49px',
        // display: 'flex',
        // flexDirection: 'column' as const,
        // alignItems: 'center',
        opacity: show ? 1 : 0,
        pointerEvents: show ? ('auto' as const) : ('none' as const),
        overflow: 'hidden' as const,
    });

    return (
        <animated.div ref={ref} style={style}>
            <animated.div style={resultStyle}>
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        overflow: 'scroll',
                        // ...globalStyles.centered,
                        flexDirection: 'column',
                    }}
                >
                    {agg.length === 0 ? (
                        <Text
                            textStyle={{ width: '100%', height: '100%', ...globalStyles.centered, padding: ".5rem" }}
                        >
                            Type a number
                        </Text>
                    ) : (
                        agg.map((x) => (
                            <div
                                key={`search-list${x.id}`}
                                style={{
                                    display: 'flex',
                                    height: 50,
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                    width: '100%',
                                    margin: '.2rem 0rem',
                                }}
                            >
                                <div style={globalStyles.centered}>
                                    <TokenViewer
                                        tokenId={x.id}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                        }}
                                    />
                                    {parseTokenIdSmart(x.id)}
                                </div>
                                {x.id.isItemId() && (
                                    <Button
                                        size="small"
                                        onClick={(event) => {
                                            updateSearchFilterViewing(SearchView.Search);

                                            setActiveFilter({
                                                type: FilterEnum.NuggsThatOwnThisItem,
                                                itemId: x.id as ItemId,
                                                only: 'nuggs',
                                            });
                                            setSearchValue('');
                                            setShow(false);
                                            event.preventDefault();
                                        }}
                                        label="view nuggs with this"
                                    />
                                )}

                                <Button
                                    size="small"
                                    onClick={() => {
                                        navigate(`/view/${lib.constants.VIEWING_PREFIX}/${x.id}`);
                                        setShow(false);
                                    }}
                                    label="VIEW"
                                />
                            </div>
                        ))
                    )}
                </div>
            </animated.div>
            <TextInput
                onClick={() => {
                    setShow(!show);
                }}
                placeholder={t`Type a number to search`}
                restrictToNumbers
                value={localSearchValue || ''}
                setValue={setSearchValue}
                className="placeholder-blue"
                style={{
                    width: '100%',
                    position: 'relative',
                    background: lib.colors.nuggBlueTransparent,
                    ...animatedBR,
                }}
                styleInputContainer={styleInput}
                leftToggles={[
                    <Button
                        buttonStyle={styles.searchBarButton}
                        onClick={() => navigate(isViewOpen ? '/swap' : '/view')}
                        rightIcon={<Search style={styles.searchBarIcon} />}
                    />,
                ]}
                rightToggles={
                    isViewOpen
                        ? [
                              ...(viewing === SearchView.Search && activeFilter
                                  ? [
                                        <Button
                                            label={`Nuggs holding ${parseTokenIdSmart(
                                                activeFilter.itemId,
                                            )}`}
                                            rightIcon={<X style={styles.searchBarIcon} size={15} />}
                                            buttonStyle={{
                                                padding: '.3rem .5rem',
                                                marginRight: '.4rem',
                                            }}
                                            textStyle={{ whiteSpace: 'nowrap' }}
                                            type="text"
                                            size="small"
                                            onClick={() => {
                                                blankNuggQuery();
                                                blankItemQuery();
                                                setActiveFilter(undefined);
                                                updateSearchFilterViewing(SearchView.Home);
                                            }}
                                        />,
                                    ]
                                  : localSearchValue || show
                                  ? [
                                        <Button
                                            buttonStyle={styles.searchBarButton}
                                            onClick={() => {
                                                if (isUndefinedOrNullOrStringEmpty(searchValue)) {
                                                    setShow(false);
                                                } else {
                                                    setSearchValue('');
                                                }
                                            }}
                                            rightIcon={<X style={styles.searchBarIcon} />}
                                        />,
                                    ]
                                  : []),
                              ...(viewing !== SearchView.Home && !activeFilter
                                  ? [
                                        <Button
                                            buttonStyle={styles.filterButton}
                                            rightIcon={
                                                sortAsc ? (
                                                    <CornerRightUp
                                                        size={14}
                                                        color={Colors.nuggBlueText}
                                                    />
                                                ) : (
                                                    <CornerRightDown
                                                        size={14}
                                                        color={Colors.nuggBlueText}
                                                    />
                                                )
                                            }
                                            onClick={() => {
                                                setSortAsc(!sortAsc);
                                                setIsUserInput(true);
                                            }}
                                        />,
                                    ]
                                  : []),
                          ]
                        : []
                }
            />
        </animated.div>
    );
};

export default React.memo(NuggDexSearchBar);
