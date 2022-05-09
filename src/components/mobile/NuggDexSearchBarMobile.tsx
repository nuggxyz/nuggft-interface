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
import useDimensions from '@src/client/hooks/useDimensions';
import { buildTokenIdFactory } from '@src/prototypes';
import styles from '@src/components/nugg/NuggDex/NuggDexSearchBar/NuggDexSearchBar.styles';
import formatLiveItem from '@src/client/formatters/formatLiveItem';
import Label from '@src/components/general/Label/Label';
import TokenViewer from '@src/components/nugg/TokenViewer';
import useAnimateOverlayBackdrop from '@src/hooks/useAnimateOverlayBackdrop';

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

const SearchBarNuggDex = ({ onBack }: { onBack: () => void }) => {
    const { isPhone } = useDimensions();
    return (
        <div style={{ width: '100%', height: '100%', padding: '10px' }}>
            <NuggDexSearchListMobile2 />
            {isPhone && <BackButton noNavigate onClick={onBack} />}
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
                overflow: 'scroll',
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
    const viewing = client.live.searchFilter.viewing();

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

    const jumpShip = React.useCallback(() => {
        setShow(false);
        setOpen(false);
    }, [setShow, setOpen]);

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
    });
    const style = useSpring({
        margin: !isPhone
            ? open
                ? '0% 0% 0% 0%'
                : '0% 5% 0% 5%'
            : open
            ? '-10 0% 0% 0%'
            : '-10 100% 0% 0%',
    });
    const animatedBR = useSpring({
        borderRadius: isPhone
            ? lib.layout.borderRadius.large
            : open
            ? '7px'
            : lib.layout.borderRadius.large,
    });

    const { height, width } = useDimensions();

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
        width: `${width}px`,
    });

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
                justifyContent: 'center',
                ...style,
            }}
        >
            <animated.div
                style={{
                    ...styles.resultContainer,

                    ...over,
                    position: 'absolute',
                    top: 0,
                    // background: lib.colors.,
                    background: 'transparent',
                    // WebkitBackdropFilter: 'blur(10px)',
                    marginTop: -13,
                    overflow: 'auto',
                }}
            >
                <div
                    style={{
                        ...styles.resultsList,
                        ...(isUndefinedOrNullOrStringEmpty(localSearchValue) &&
                            {
                                // marginTop: 90,
                            }),
                        overflow: 'auto',
                        marginTop: 13,
                        // top: 0,
                    }}
                >
                    {isUndefinedOrNullOrStringEmpty(localSearchValue) ? (
                        <SearchBarNuggDex onBack={jumpShip} />
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
            <TextInput
                // triggerFocus={open}
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
                    background: lib.colors.transparentWhite,
                    ...animatedBR,
                    WebkitBackdropFilter: 'blur(50px)',
                    zIndex: 1000,
                }}
                styleInputContainer={styleInput}
                leftToggles={[
                    <Button
                        buttonStyle={{
                            ...styles.searchBarButton,

                            ...(isPhone && {
                                width: 60,
                                height: 60,
                            }),
                        }}
                        onClick={() => {
                            setOpen(!open);
                            setShow(!show);
                        }}
                        rightIcon={
                            <Search
                                style={{
                                    ...styles.searchBarIcon,

                                    ...(isPhone && {
                                        color: lib.colors.semiTransparentPrimaryColor,
                                    }),
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
                                            rightIcon={
                                                <X style={{ color: lib.colors.primaryColor }} />
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
        </animated.div>
    );
};

export default React.memo(NuggDexSearchBarMobile);
