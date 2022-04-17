import { animated, useSpring } from '@react-spring/web';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { ChevronRight, Search, X } from 'react-feather';
import { t } from '@lingui/macro';
import { useMatch, useNavigate } from 'react-router-dom';
import { BsFillPinFill } from 'react-icons/bs';

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
import useDimentions from '@src/client/hooks/useDimentions';

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
    const { screen: screenType, isPhone } = useDimentions();

    const [mobileExpanded, setMobileExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [localSearchValue, setSearchValue] = useState('');
    const [isUserInput, setIsUserInput] = useState(false);
    const updateSearchFilterSearchValue = client.mutate.updateSearchFilterSearchValue();
    const updateSearchFilterSort = client.mutate.updateSearchFilterSort();
    const updateSearchFilterViewing = client.mutate.updateSearchFilterViewing();

    const [sortAsc, setSortAsc] = useState(sort && sort.direction === 'asc');

    const [activeFilter, setActiveFilter] = React.useState<Filter>();
    const [show, setShow] = React.useState<boolean>(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isViewOpen) {
            updateSearchFilterSearchValue(localSearchValue);
        } else {
            setSearchValue('');
        }
    }, [localSearchValue, isViewOpen, updateSearchFilterSearchValue]);

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
        if (!isUndefinedOrNullOrStringEmpty(localSearchValue)) {
            setShow(true);
        }
    }, [setShow, localSearchValue]);

    useEffect(() => {
        if (isUndefinedOrNullOrStringEmpty(localSearchValue)) {
            setSearchedNuggsData([]);
            setSearchedItemsData([]);
        }
    }, [localSearchValue]);

    useEffect(() => {
        if (localSearchValue && localSearchValue !== '') {
            let cancelled = false;
            setLoading(true);
            void Promise.all([
                getAllItems({
                    variables: {
                        orderBy: Item_OrderBy.Idnum,
                        where: {
                            position: localSearchValue,
                        },
                    },
                }).then((x) => {
                    if (!cancelled) {
                        setSearchedItemsData(x.data.items);
                    }
                }),
                getAllNuggs({
                    variables: {
                        orderBy: Nugg_OrderBy.Idnum,

                        where: {
                            id: localSearchValue,
                        },
                    },
                }).then((x) => {
                    if (!cancelled) {
                        setSearchedNuggsData(x.data.nuggs);
                    }
                }),
            ]).then(() => setLoading(false));
            return () => {
                cancelled = true;
                setLoading(false);
            };
        }
        return () => {};
    }, [localSearchValue, getAllNuggs, getAllItems, setSearchedNuggsData, setSearchedItemsData]);

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
    useOnClickOutside(ref, () => {
        setShow(false);
        setMobileExpanded(false);
    });

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

    const styleInput = useSpring({
        width: isViewOpen ? '100%' : '0%',
    });
    const style = useSpring({
        ...styles.searchBar,
        margin:
            isViewOpen && !isPhone
                ? '0% 5% 0% 5%'
                : isViewOpen && mobileExpanded
                ? '0% 0% 0% 0%'
                : '0% 100% 0% 0%',
    });
    const animatedBR = useSpring({
        borderRadius: isViewOpen && (!isPhone || mobileExpanded) ? '7px' : '20px',
    });

    const resultStyle = useSpring({
        ...styles.resultContainer,
        width: show ? '103%' : '100%',
        height: show ? (agg.length === 0 ? '230%' : '1100%') : '100%',
        top: show ? '-20%' : '0%',
        opacity: show ? 1 : 0,
        pointerEvents: show ? ('auto' as const) : ('none' as const),
    });

    return (
        <animated.div ref={ref} style={style}>
            <animated.div style={resultStyle}>
                <div style={styles.resultsList}>
                    {agg.length === 0 ? (
                        <Text textStyle={styles.resultText}>
                            {isUndefinedOrNullOrStringEmpty(localSearchValue)
                                ? t`Type a number`
                                : loading
                                ? t`Loading`
                                : t`No results`}
                        </Text>
                    ) : (
                        agg.map((x) => (
                            <div
                                key={`search-list${x.id}`}
                                style={{
                                    ...styles.resultListItemContainer,
                                    flexDirection: screenType !== 'desktop' ? 'column' : 'row',
                                }}
                            >
                                <div style={globalStyles.centered}>
                                    <TokenViewer
                                        tokenId={x.id}
                                        style={styles.resultListItemToken}
                                    />
                                    <Text
                                        size="small"
                                        type="text"
                                        textStyle={styles.resultListItemId}
                                    >
                                        {parseTokenIdSmart(x.id)}
                                    </Text>
                                </div>
                                <div
                                    style={{
                                        display: 'flex',
                                        ...(screenType !== 'desktop'
                                            ? {
                                                  width: '100%',
                                                  paddingTop: '.5rem',
                                                  justifyContent: x.id.isItemId()
                                                      ? 'space-between'
                                                      : 'flex-end',
                                              }
                                            : {}),
                                    }}
                                >
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
                                                if (screenType === 'phone') {
                                                    setMobileExpanded(false);
                                                    navigate('/view');
                                                }
                                                event.preventDefault();
                                            }}
                                            buttonStyle={{
                                                ...styles.gradientContainer,
                                                marginRight: '.5rem',
                                                paddingRight: '.5rem',
                                            }}
                                            textStyle={{
                                                ...styles.gradientText,
                                                paddingRight: '.4rem',
                                            }}
                                            label={t`view nuggs with this`}
                                            rightIcon={
                                                <BsFillPinFill
                                                    color={lib.colors.gradientPink}
                                                    style={{ marginBottom: '-.1rem' }}
                                                />
                                            }
                                        />
                                    )}

                                    <Button
                                        size="small"
                                        // type="text"
                                        onClick={() => {
                                            navigate(
                                                `/view/${lib.constants.VIEWING_PREFIX}/${x.id}`,
                                            );
                                            setShow(false);
                                            setMobileExpanded(false);
                                        }}
                                        label={t`VIEW`}
                                        buttonStyle={styles.gradientContainer}
                                        textStyle={{
                                            ...styles.gradientText,
                                            backgroundImage: lib.colors.gradient2,
                                        }}
                                        rightIcon={<ChevronRight color={lib.colors.green} />}
                                    />
                                </div>
                                <div style={styles.separator} />
                            </div>
                        ))
                    )}
                </div>
            </animated.div>
            <TextInput
                triggerFocus={mobileExpanded}
                onClick={() => {
                    setShow(!isPhone ? !show : true);
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
                        onClick={() => {
                            if (!isPhone) {
                                navigate(isViewOpen ? '/live' : '/view');
                                setShow(false);
                            } else if (isViewOpen) {
                                setMobileExpanded(!mobileExpanded);
                                setShow(!show);
                            } else {
                                navigate('/view');
                            }
                        }}
                        rightIcon={<Search style={styles.searchBarIcon} />}
                    />,
                ]}
                rightToggles={
                    (isViewOpen && !isPhone) || mobileExpanded
                        ? [
                              ...(viewing === SearchView.Search && activeFilter
                                  ? [
                                        <Button
                                            label={`Nuggs holding ${parseTokenIdSmart(
                                                activeFilter.itemId,
                                            )}`}
                                            rightIcon={
                                                <X
                                                    style={{ color: lib.colors.gradientPink }}
                                                    size={15}
                                                />
                                            }
                                            buttonStyle={{
                                                backgroundColor: lib.colors.white,
                                                padding: '.2rem .5rem .2rem .7rem',
                                                marginRight: '.4rem',
                                            }}
                                            textStyle={{
                                                background: lib.colors.gradient3,
                                                color: 'black',
                                                whiteSpace: 'nowrap',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                paddingRight: '.4rem',
                                            }}
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
                                                    setMobileExpanded(false);
                                                } else {
                                                    setSearchValue('');
                                                }
                                            }}
                                            rightIcon={<X style={styles.searchBarIcon} />}
                                        />,
                                    ]
                                  : []),
                              //   ...(viewing !== SearchView.Home && !activeFilter
                              //       ? [
                              //             <Button
                              //                 buttonStyle={styles.filterButton}
                              //                 rightIcon={
                              //                     sortAsc ? (
                              //                         <CornerRightUp
                              //                             size={14}
                              //                             color={Colors.nuggBlueText}
                              //                         />
                              //                     ) : (
                              //                         <CornerRightDown
                              //                             size={14}
                              //                             color={Colors.nuggBlueText}
                              //                         />
                              //                     )
                              //                 }
                              //                 onClick={() => {
                              //                     setSortAsc(!sortAsc);
                              //                     setIsUserInput(true);
                              //                 }}
                              //             />,
                              //         ]
                              //       : []),
                          ]
                        : []
                }
            />
        </animated.div>
    );
};

export default React.memo(NuggDexSearchBar);
