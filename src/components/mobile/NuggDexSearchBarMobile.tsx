import { animated, useSpring } from '@react-spring/web';
import React, { FC, FunctionComponent, useEffect, useState } from 'react';
import { Search, X } from 'react-feather';
import { t } from '@lingui/macro';
import { useMatch, useNavigate } from 'react-router-dom';

import Button from '@src/components/general/Buttons/Button/Button';
import TextInput from '@src/components/general/TextInputs/TextInput/TextInput';
import Text from '@src/components/general/Texts/Text/Text';
import client from '@src/client';
import { ListData, LiveItem, SearchView } from '@src/client/interfaces';
import {
    Nugg_OrderBy,
    useGetAllItemsQuery,
    useGetAllNuggsQuery,
    Item_OrderBy,
    useGetAllNuggsSearchQuery,
    useGetAllItemsSearchQuery,
    GetAllNuggsSearchQuery,
    GetAllItemsSearchQuery,
    LiveItemFragment,
} from '@src/gql/types.generated';
import lib, { isUndefinedOrNullOrStringEmpty, parseTokenIdSmart } from '@src/lib/index';
import useOnClickOutside from '@src/hooks/useOnClickOutside';
import useDimentions from '@src/client/hooks/useDimentions';
import { buildTokenIdFactory } from '@src/prototypes';
import styles from '@src/components/nugg/NuggDex/NuggDexSearchBar/NuggDexSearchBar.styles';
import NuggDexSearchList from '@src/components/nugg/NuggDex/NuggDexSearchList/NuggDexSearchList';
import formatLiveItem from '@src/client/formatters/formatLiveItem';
import Label from '@src/components/general/Label/Label';
import TokenViewer from '@src/components/nugg/TokenViewer';

import { MobileContainer } from './NuggListRenderItemMobile';

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

const SearchBarNuggDex = () => {
    return (
        <div style={{ width: '100%', height: '100%', padding: '10px' }}>
            <NuggDexSearchList />
        </div>
    );
};

export const SearchBarItem: FC<{ item: LiveItem }> = ({ item }) => {
    // const openModal = client.modal.useOpenModal();

    const navigate = useNavigate();
    return (
        <div
            aria-hidden="true"
            className="mobile-pressable-div"
            style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',

                width: '140px',
                height: '140px',

                flexDirection: 'column',
                justifyContent: 'center',
                marginBottom: '1.5rem',
                background:
                    item.tryout.count > 0
                        ? lib.colors.gradient3Transparent
                        : lib.colors.nuggBlueTransparent,
                borderRadius: lib.layout.borderRadius.mediumish,
            }}
            onClick={() => {
                navigate(`/swap/${item.tokenId}`);
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '.3rem',
                    borderRadius: lib.layout.borderRadius.large,
                    position: 'absolute',
                    top: '.1rem',
                    right: '.1rem',
                    paddingBottom: 5,
                }}
            >
                <Label
                    type="text"
                    size="small"
                    textStyle={{
                        color: lib.colors.transparentDarkGrey,
                        // marginLeft: '.5rem',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        // paddingBottom: 5,
                        position: 'relative',
                    }}
                    text={item.tokenId.toPrettyId()}
                />
            </div>

            {/* <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '.3rem',
                    borderRadius: lib.layout.borderRadius.large,
                    position: 'absolute',
                    bottom: 4,
                    // right: 2,
                    paddingBottom: 5,
                }}
            >
                <Label
                    type="text"
                    size="small"
                    textStyle={{
                        color: lib.colors.transparentDarkGrey,
                        // marginLeft: '.5rem',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        // paddingBottom: 5,
                        position: 'relative',
                    }}
                    text={`${item.count} in circulation`}
                />
            </div> */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <TokenViewer
                    tokenId={item.tokenId}
                    style={{
                        height: '80px',
                        width: '80px',
                    }}
                />
            </div>

            {item.tryout.count > 0 ? (
                <div
                    style={{
                        position: 'absolute',

                        bottom: 5,
                        // left: 1,
                        display: 'flex',
                        flexDirection: 'row',
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'end',
                        textAlign: 'center',
                    }}
                >
                    <Label
                        size="small"
                        text={`${item.tryout.count} for sale`}
                        containerStyles={{ background: lib.colors.gradient3 }}
                        textStyle={{ color: 'white' }}
                    />
                </div>
            ) : null}
            {/* {Number(item.feature) !== constants.FEATURE_BASE &&
                extraData.isOwner &&
                (!item.activeSwap ? (
                    <Button
                        label="Sell"
                        buttonStyle={{
                            borderRadius: lib.layout.borderRadius.large,
                            background: lib.colors.gradient2Transparent,
                            position: 'absolute',
                            right: '1rem',
                        }}
                        leftIcon={<IoPricetagsOutline color={lib.colors.white} />}
                        textStyle={{
                            color: lib.colors.white,
                            marginLeft: '.5rem',
                        }}
                        type="text"
                        onClick={() => {
                            openModal({
                                modalType: ModalEnum.Sell,
                                tokenId: item.id,
                                tokenType: 'item',
                                sellingNuggId: extraData.tokenId,
                            });
                        }}
                    />
                ) : (
                    <Button
                        label="Reclaim"
                        buttonStyle={{
                            borderRadius: lib.layout.borderRadius.large,
                            background: lib.colors.gradient2Transparent,
                            position: 'absolute',
                            right: '1rem',
                        }}
                        leftIcon={<IoSync color={lib.colors.white} />}
                        textStyle={{
                            color: lib.colors.white,
                            marginLeft: '.5rem',
                        }}
                        type="text"
                        onClick={() => {
                            if (item.activeSwap && sender)
                                void send(
                                    nuggft.populateTransaction.claim(
                                        [formatItemSwapIdForSend(item.activeSwap).sellingNuggId],
                                        [Address.ZERO.hash],
                                        [sender],
                                        [formatItemSwapIdForSend(item.activeSwap).itemId],
                                    ),
                                );
                        }}
                    />
                ))} */}
        </div>
    );
};

const SearchBarResults = ({
    tokens,
}: {
    tokens: (GetAllItemsSearchQuery['items'][number] | GetAllNuggsSearchQuery['nuggs'][number])[];
}) => {
    const nugg = React.useMemo(() => {
        const res = tokens.find((x) => x.__typename === 'Nugg');
        if (res) return res.id.toNuggId();
        return undefined;
    }, [tokens]);

    const itemsData = React.useMemo(() => {
        return formatLiveItem(tokens.filter((x) => x.__typename === 'Item') as LiveItemFragment[]);
    }, [tokens]);

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'scroll',
                // marginTop: 90,
                // marginBottom: 500,
            }}
        >
            <div style={{ width: '100%', marginTop: '90px' }} />
            {nugg && (
                <>
                    <Text size="large">Nugg</Text>
                    <MobileContainer tokenId={nugg} />
                </>
            )}

            <Text size="large">Items</Text>
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    padding: '10px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-around',
                }}
            >
                {itemsData.map((x) => (
                    <>
                        <SearchBarItem item={x} />
                    </>
                ))}
            </div>

            {/* <NuggDexSearchList /> */}
        </div>
    );
};

const NuggDexSearchBarMobile: FunctionComponent<{
    open: boolean;
    setOpen: (arg: boolean) => void;
}> = ({ open, setOpen }) => {
    const viewing = client.live.searchFilter.viewing();

    const isViewOpen = useMatch('view/*');
    const sort = client.live.searchFilter.sort();
    const searchValue = client.live.searchFilter.searchValue();
    const { isPhone } = useDimentions();

    // const [open, setMobileExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [localSearchValue, setSearchValue] = useState('');
    const [isUserInput, setIsUserInput] = useState(false);
    const updateSearchFilterSearchValue = client.mutate.updateSearchFilterSearchValue();
    const updateSearchFilterSort = client.mutate.updateSearchFilterSort();
    const updateSearchFilterViewing = client.mutate.updateSearchFilterViewing();

    const [sortAsc, setSortAsc] = useState(sort && sort.direction === 'asc');

    const [activeFilter, setActiveFilter] = React.useState<Filter>();
    const [show, setShow] = React.useState<boolean>(false);
    // const navigate = useNavigate();

    useEffect(() => {
        if (open) {
            updateSearchFilterSearchValue(localSearchValue);
        } else {
            setSearchValue('');
        }
    }, [localSearchValue, open, updateSearchFilterSearchValue]);

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

    const [searchedNuggsData, setSearchedNuggsData] = React.useState<
        GetAllNuggsSearchQuery['nuggs']
    >([]);
    const [searchedItemsData, setSearchedItemsData] = React.useState<
        GetAllItemsSearchQuery['items']
    >([]);

    const { fetchMore: getAllNuggs } = useGetAllNuggsQuery({
        fetchPolicy: 'network-only',
    });

    const { fetchMore: getAllItems } = useGetAllItemsQuery({
        fetchPolicy: 'network-only',
    });

    const { fetchMore: getAllNuggsSearch } = useGetAllNuggsSearchQuery({
        fetchPolicy: 'network-only',
    });

    const { fetchMore: getAllItemsSearch } = useGetAllItemsSearchQuery({
        fetchPolicy: 'network-only',
    });

    const blankItemQuery = React.useCallback(() => {
        setSearchedItemsData([]);
    }, [setSearchedItemsData]);

    const blankNuggQuery = React.useCallback(() => {
        setSearchedNuggsData([]);
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
                getAllItemsSearch({
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
                getAllNuggsSearch({
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
    }, [
        localSearchValue,
        getAllNuggsSearch,
        getAllItemsSearch,
        setSearchedNuggsData,
        setSearchedItemsData,
    ]);

    const setActiveSearch = client.mutate.setActiveSearch();

    useEffect(() => {
        switch (activeFilter?.type) {
            case FilterEnum.NuggsThatOwnThisItem: {
                void getAllNuggs({
                    variables: {
                        where: {
                            _items_contains_nocase: [+activeFilter.itemId.toRawId()],
                        },
                    },
                }).then((x) => {
                    setActiveSearch([
                        ...(x.data.nuggs.map((y) =>
                            buildTokenIdFactory({
                                tokenId: y.id.toNuggId(),
                                listDataType: 'basic' as const,
                            }),
                        ) || []),
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
    }, [activeFilter, getAllItems, getAllNuggs, blankItemQuery, setActiveSearch]);

    const ref = React.useRef(null);
    useOnClickOutside(ref, () => {
        setShow(false);
        setOpen(false);
    });

    const agg = React.useMemo(() => {
        return [
            ...(searchedNuggsData ?? []).map((x) => ({
                tokenId: x.id,
                listDataType: 'basic' as const,
            })),
            ...(searchedItemsData ?? []).map((x) => ({
                tokenId: `item-${x.id}`,
                listDataType: 'basic' as const,
            })),
        ] as ListData[];
    }, [searchedNuggsData, searchedItemsData]);

    const styleInput = useSpring({
        width: open ? '100%' : '0%',
    });
    const style = useSpring({
        ...styles.searchBar,
        margin: !isPhone ? '0% 5% 0% 5%' : open ? '0% 0% 0% 0%' : '0% 100% 0% 0%',
    });
    const animatedBR = useSpring({
        borderRadius: !isPhone || open ? '7px' : lib.layout.borderRadius.large,
    });

    const resultStyle = useSpring({
        ...styles.resultContainer,
        width: show ? '110%' : '100%',
        height: show ? (agg.length === 0 ? '1100%' : '1100%') : '100%',
        top: show ? '-20%' : '0%',
        opacity: show ? 1 : 0,
        pointerEvents: show ? ('auto' as const) : ('none' as const),
    });

    return (
        <animated.div ref={ref} style={style}>
            <animated.div
                style={{
                    ...resultStyle,
                    position: 'absolute',
                    top: 0,
                    // background: lib.colors.gradient2Transparent,
                    background: 'white',
                    WebkitBackdropFilter: 'blur(50px)',
                    marginTop: -13,
                }}
            >
                <div
                    style={{
                        ...styles.resultsList,
                        ...(isUndefinedOrNullOrStringEmpty(localSearchValue) &&
                            {
                                // marginTop: 90,
                            }),
                        overflow: 'hidden',
                        marginTop: 13,
                        // top: 0,
                    }}
                >
                    {isUndefinedOrNullOrStringEmpty(localSearchValue) ? (
                        <SearchBarNuggDex />
                    ) : agg.length === 0 ? (
                        <Text textStyle={styles.resultText}>
                            {isUndefinedOrNullOrStringEmpty(localSearchValue)
                                ? t`Type a number`
                                : loading
                                ? t`Loading`
                                : t`No results`}
                        </Text>
                    ) : (
                        <>
                            <SearchBarResults
                                tokens={[...searchedItemsData, ...searchedNuggsData]}
                            />
                        </>
                        // agg.map((x) => (
                        //     <div
                        //         key={`search-list${x.tokenId}`}
                        //         style={{
                        //             ...styles.resultListItemContainer,
                        //             flexDirection: screenType !== 'desktop' ? 'column' : 'row',
                        //         }}
                        //     >
                        //         <div style={globalStyles.centered}>
                        //             <TokenViewer
                        //                 tokenId={x.tokenId}
                        //                 style={styles.resultListItemToken}
                        //             />
                        //             <Text
                        //                 size="small"
                        //                 type="text"
                        //                 textStyle={styles.resultListItemId}
                        //             >
                        //                 {parseTokenIdSmart(x.tokenId)}
                        //             </Text>
                        //         </div>
                        //         <div
                        //             style={{
                        //                 display: 'flex',
                        //                 ...(screenType !== 'desktop'
                        //                     ? {
                        //                           width: '100%',
                        //                           paddingTop: '.5rem',
                        //                           justifyContent: x.tokenId.isItemId()
                        //                               ? 'space-between'
                        //                               : 'flex-end',
                        //                       }
                        //                     : {}),
                        //             }}
                        //         >
                        //             {x.tokenId.isItemId() && (
                        //                 <Button
                        //                     size="small"
                        //                     onClick={(event) => {
                        //                         updateSearchFilterViewing(SearchView.Search);

                        //                         setActiveFilter({
                        //                             type: FilterEnum.NuggsThatOwnThisItem,
                        //                             itemId: x.tokenId as ItemId,
                        //                             only: 'nuggs',
                        //                         });
                        //                         setSearchValue('');
                        //                         setShow(false);
                        //                         if (screenType === 'phone') {
                        //                             setOpen(false);
                        //                             navigate('/view');
                        //                         }
                        //                         event.preventDefault();
                        //                     }}
                        //                     buttonStyle={{
                        //                         ...styles.gradientContainer,
                        //                         marginRight: '.5rem',
                        //                         paddingRight: '.5rem',
                        //                     }}
                        //                     textStyle={{
                        //                         ...styles.gradientText,
                        //                         paddingRight: '.4rem',
                        //                     }}
                        //                     label={t`view nuggs with this`}
                        //                     rightIcon={
                        //                         <BsFillPinFill
                        //                             color={lib.colors.gradientPink}
                        //                             style={{ marginBottom: '-.1rem' }}
                        //                         />
                        //                     }
                        //                 />
                        //             )}

                        //             <Button
                        //                 size="small"
                        //                 // type="text"
                        //                 onClick={() => {
                        //                     navigate(
                        //                         isPhone
                        //                             ? `/swap/${x.tokenId}`
                        //                             : `/view/${lib.constants.VIEWING_PREFIX}/${x.tokenId}`,
                        //                     );
                        //                     setShow(false);
                        //                     setOpen(false);
                        //                 }}
                        //                 label={t`VIEW`}
                        //                 buttonStyle={styles.gradientContainer}
                        //                 textStyle={{
                        //                     ...styles.gradientText,
                        //                     backgroundImage: lib.colors.gradient2,
                        //                 }}
                        //                 rightIcon={<ChevronRight color={lib.colors.green} />}
                        //             />
                        //         </div>
                        //         <div style={styles.separator} />
                        //     </div>
                        // ))
                    )}
                </div>
            </animated.div>
            <TextInput
                triggerFocus={open}
                onClick={() => {
                    setShow(!isPhone ? !show : true);
                }}
                placeholder={t`Type a number to search`}
                restrictToNumbers
                value={localSearchValue || ''}
                setValue={setSearchValue}
                className={isPhone ? 'placeholder-dark' : 'placeholder-blue'}
                style={{
                    width: '100%',
                    position: 'relative',
                    background: lib.colors.nuggBlueTransparent,
                    ...animatedBR,
                    WebkitBackdropFilter: 'blur(30px)',
                }}
                styleInputContainer={styleInput}
                leftToggles={[
                    <Button
                        buttonStyle={{
                            ...styles.searchBarButton,
                            ...(isPhone && {
                                // padding: 10,
                                width: 60,
                                height: 60,
                            }),
                        }}
                        onClick={() => {
                            // if (!isPhone) {
                            //     navigate(isViewOpen ? '/live' : '/view');
                            //     setShow(false);
                            // } else if (isViewOpen) {
                            setOpen(!open);
                            setShow(!show);
                            // } else {
                            //     navigate('/view');
                            // }
                        }}
                        rightIcon={
                            <Search
                                style={{
                                    ...styles.searchBarIcon,
                                }}
                                size={isPhone ? 40 : undefined}
                            />
                        }
                    />,
                ]}
                rightToggles={
                    (isViewOpen && !isPhone) || open
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
                                                    setOpen(false);
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

export default React.memo(NuggDexSearchBarMobile);
