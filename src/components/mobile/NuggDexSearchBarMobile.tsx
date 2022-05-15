import { animated, useSpring } from '@react-spring/web';
import React, { FC, FunctionComponent, useEffect, useState } from 'react';
import { X } from 'react-feather';
import { t } from '@lingui/macro';
import { useMatch, useNavigate } from 'react-router-dom';
import { IoSearch } from 'react-icons/io5';

import Button from '@src/components/general/Buttons/Button/Button';
import TextInput from '@src/components/general/TextInputs/TextInput/TextInput';
import Text from '@src/components/general/Texts/Text/Text';
import client from '@src/client';
import { ListData, LiveItem } from '@src/client/interfaces';
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
import lib, { isUndefinedOrNullOrStringEmpty } from '@src/lib/index';
import useOnClickOutside from '@src/hooks/useOnClickOutside';
import useDimensions from '@src/client/hooks/useDimensions';
import { buildTokenIdFactory } from '@src/prototypes';
import styles from '@src/components/nugg/NuggDex/NuggDexSearchBar/NuggDexSearchBar.styles';
import formatLiveItem from '@src/client/formatters/formatLiveItem';
import Label from '@src/components/general/Label/Label';
import TokenViewer from '@src/components/nugg/TokenViewer';
import useAnimateOverlayBackdrop from '@src/hooks/useAnimateOverlayBackdrop';
import IconButton from '@src/components/general/Buttons/IconButton/IconButton';

import { MobileContainerBig } from './NuggListRenderItemMobile';
import BackButton from './BackButton';
import NuggDexSearchListMobile2 from './NuggDexSearchListMobile2';

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

const SearchBarNuggDex = ({
    onBack,
    page,
    setPage,
}: {
    onBack: () => void;
    page: 'search' | 'home' | 'all nuggs' | 'all items';
    setPage: (input: 'search' | 'home' | 'all nuggs' | 'all items') => void;
}) => {
    return (
        <div style={{ width: '100%', height: '100%', padding: '0px 10px' }}>
            <NuggDexSearchListMobile2 page={page} setPage={setPage} />
            <BackButton noNavigate onClick={onBack} />
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
                        : lib.colors.transparentWhite,
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
                // overflow: 'scroll',
                // marginTop: 90,
                // marginBottom: 500,
            }}
        >
            <div style={{ width: '100%', marginTop: '90px' }} />
            {nugg && (
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        alignItems: 'center',
                    }}
                >
                    <Text size="larger" textStyle={{ paddingLeft: '30px', width: '100%' }}>
                        Nugg
                    </Text>
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
                        <MobileContainerBig tokenId={nugg} />{' '}
                    </div>
                    <div style={{ width: '100%', marginTop: '40px' }} />
                </div>
            )}

            <Text size="larger" textStyle={{ paddingLeft: '30px' }}>
                Items
            </Text>
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
    const isViewOpen = useMatch('view/*');
    const sort = client.live.searchFilter.sort();
    const searchValue = client.live.searchFilter.searchValue();
    const { isPhone } = useDimensions();

    // const [open, setMobileExpanded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [localSearchValue, setSearchValue] = useState('');
    const [isUserInput, setIsUserInput] = useState(false);
    const updateSearchFilterSearchValue = client.mutate.updateSearchFilterSearchValue();
    const updateSearchFilterSort = client.mutate.updateSearchFilterSort();

    const [sortAsc, setSortAsc] = useState(sort && sort.direction === 'asc');

    const [activeFilter] = React.useState<Filter>();
    const [show, setShow] = React.useState<boolean>(false);
    // const navigate = useNavigate();
    const [page, setPage] = React.useState<'search' | 'home' | 'all nuggs' | 'all items'>('home');

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

    const ref = React.useRef<HTMLDivElement>(null);

    const jumpShip = React.useCallback(() => {
        setShow(false);
        setOpen(false);
        setPage('home');
    }, [setShow, setOpen, setPage]);

    useOnClickOutside(ref, jumpShip);

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
        background: 'transparent',
        display: open ? 'flex' : 'none',
    });
    // const style = useSpring({
    //     margin: open ? '-10 0% 0% 0%' : '-10 100% 0% 0%',
    // });
    const animatedBR = useSpring({
        padding: open ? 5 : 0,
        background: open ? lib.colors.transparentWhite : 'transparent',
        WebkitBackdropFilter: open ? 'blur(50px)' : undefined,
    });

    const { height, offsetTop, width } = client.viewport.useVisualViewport();

    // const resultStyle = useSpring({
    //     width: show ? '115%' : '100%',
    //     height: show ?  `${height}px` : '100%',
    //     top: show ? '-30%' : '0%',
    //     opacity: show ? 1 : 0,
    //     pointerEvents: show ? ('auto' as const) : ('none' as const),
    // });

    const over = useAnimateOverlayBackdrop(show, {
        height: `${height}px`,
        zIndex: 998,
        width: `${width + 1}px`,
    });

    console.log({ height, width, offsetTop });

    return (
        <animated.div
            ref={ref}
            style={{
                zIndex: 999,
                fontFamily: lib.layout.font.sf.regular,
                pointerEvents: 'auto',
                width: '93%',
                position: 'relative',
                display: 'flex',
                justifyContent: 'flex-start',
                // ...style,
            }}
        >
            <animated.div
                style={{
                    // borderRadius: lib.layout.borderRadius.mediumish,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: `${lib.layout.boxShadow.prefix} ${lib.layout.boxShadow.dark}`,
                    ...over,
                    top: page === 'search' || page === 'home' ? -23 : -47,
                    left: -22,
                    position: 'absolute',
                    justifyContent: 'flex-start',
                    // top: 0,
                    // background: lib.colors.,
                    // background: 'transparent',
                    // WebkitBackdropFilter: 'blur(10px)',
                    overflow: 'auto',
                    // background: 'red',
                }}
                onScroll={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        // overflow: 'auto',
                        // marginTop: 13,
                        zIndex: 1001,

                        // top: 0,
                    }}
                >
                    {isUndefinedOrNullOrStringEmpty(localSearchValue) ? (
                        <SearchBarNuggDex onBack={jumpShip} page={page} setPage={setPage} />
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
                    )}
                </div>
            </animated.div>
            {page === 'search' || page === 'home' ? (
                <TextInput
                    triggerFocus={open}
                    onClick={() => {
                        setShow(true);
                        setOpen(true);
                    }}
                    placeholder={t`Type a number to search`}
                    restrictToNumbers
                    value={localSearchValue || ''}
                    setValue={setSearchValue}
                    className={isPhone ? 'placeholder-dark' : 'placeholder-blue'}
                    style={{
                        width: open ? '100%' : 0,
                        position: 'relative',
                        ...animatedBR,
                        // opacity: page === 'search' || page === 'home' ? 1 : 0,
                        borderRadius: lib.layout.borderRadius.large,
                        // WebkitBackdropFilter: 'blur(50px)',
                        zIndex: 1000,
                        background: 'transparent',
                        display: 'flex',
                    }}
                    styleInputContainer={styleInput}
                    leftToggles={[
                        <IconButton
                            aria-hidden="true"
                            buttonStyle={{
                                padding: 0,
                                background: 'transparent',
                                borderRadius: lib.layout.borderRadius.large,
                                // boxShadow: lib.layout.boxShadow.medium,
                            }}
                            onClick={() => {
                                setOpen(!open);
                                setShow(!show);
                            }}
                            iconComponent={
                                <IoSearch
                                    style={{
                                        color: lib.colors.semiTransparentPrimaryColor,
                                        // padding: 0,
                                    }}
                                    size={50}
                                />
                            }
                        />,
                    ]}
                    rightToggles={
                        (isViewOpen && !isPhone) || open
                            ? [
                                  ...(localSearchValue || show
                                      ? [
                                            <Button
                                                buttonStyle={styles.searchBarButton}
                                                onClick={() => {
                                                    if (
                                                        isUndefinedOrNullOrStringEmpty(searchValue)
                                                    ) {
                                                        setShow(false);
                                                        setOpen(false);
                                                        setPage('home');
                                                    } else {
                                                        setSearchValue('');
                                                    }
                                                }}
                                                rightIcon={
                                                    <X
                                                        style={{
                                                            color: lib.colors.primaryColor,
                                                        }}
                                                    />
                                                }
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
            ) : (
                <div style={{ position: 'relative' }} />
            )}
        </animated.div>
    );
};

export default React.memo(NuggDexSearchBarMobile);
