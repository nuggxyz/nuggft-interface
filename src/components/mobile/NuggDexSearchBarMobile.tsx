import { animated } from '@react-spring/web';
import React, { FC, FunctionComponent, useEffect, useState } from 'react';
import { X } from 'react-feather';
import { t } from '@lingui/macro';
import { useNavigate } from 'react-router-dom';
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
import IconButton from '@src/components/general/Buttons/IconButton/IconButton';

import { MobileContainerBig } from './NuggListRenderItemMobile';
// import BackButton from './BackButton';
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

export const SearchBarItem: FC<{ item: LiveItem }> = ({ item }) => {
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
        </div>
    );
};

const NuggDexSearchBarMobile: FunctionComponent<unknown> = () => {
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

    const nuggbookClose = client.nuggbook.useCloseNuggBook();

    useEffect(() => {
        updateSearchFilterSearchValue(localSearchValue);
    }, [localSearchValue, updateSearchFilterSearchValue]);

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
        fetchPolicy: 'no-cache',
    });

    const { fetchMore: getAllItems } = useGetAllItemsQuery({
        fetchPolicy: 'no-cache',
    });

    const { fetchMore: getAllNuggsSearch } = useGetAllNuggsSearchQuery({
        fetchPolicy: 'no-cache',
    });

    const { fetchMore: getAllItemsSearch } = useGetAllItemsSearchQuery({
        fetchPolicy: 'no-cache',
    });

    const blankItemQuery = React.useCallback(() => {
        setSearchedItemsData([]);
    }, [setSearchedItemsData]);

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
        nuggbookClose();
    }, [nuggbookClose]);

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

    return (
        <animated.div
            ref={ref}
            style={{
                zIndex: 999,
                ...lib.layout.presets.font.main.regular,
                width: '100%',
                position: 'relative',
                display: 'flex',
                justifyContent: 'flex-start',
                height: '100%',
                flexDirection: 'column',
                pointerEvents: 'auto',
            }}
        >
            <TextInput
                // triggerFocus={open}

                placeholder={t`Type a number to search`}
                restrictToNumbers
                value={localSearchValue || ''}
                setValue={setSearchValue}
                className={isPhone ? 'placeholder-dark' : 'placeholder-blue'}
                style={{
                    marginTop: 12,
                    width: '100%',

                    position: 'relative',
                    padding: 5,
                    background: lib.colors.transparentWhite,
                    WebkitBackdropFilter: 'blur(50px)',
                    backdropFilter: 'blur(50px)',
                    borderRadius: lib.layout.borderRadius.large,
                    zIndex: 1000,
                    display: 'flex',
                }}
                styleInputContainer={{
                    width: '100%',
                    background: 'transparent',
                    display: 'flex',
                }}
                leftToggles={[
                    <IconButton
                        aria-hidden="true"
                        buttonStyle={{
                            padding: 0,
                            height: 75,
                            width: 75,
                            background: 'transparent',
                            borderRadius: lib.layout.borderRadius.large,
                        }}
                        onClick={() => {}}
                        iconComponent={
                            <IoSearch
                                style={{
                                    color: lib.colors.semiTransparentPrimaryColor,
                                }}
                                size={50}
                            />
                        }
                    />,
                ]}
                rightToggles={[
                    ...(localSearchValue
                        ? [
                              <Button
                                  buttonStyle={styles.searchBarButton}
                                  onClick={() => {
                                      if (isUndefinedOrNullOrStringEmpty(searchValue)) {
                                          nuggbookClose();
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
                ]}
            />

            <div
                style={{
                    height: '100%',
                    width: '100%',
                    // overflow: 'auto',
                    // marginTop: 13,
                    zIndex: 1001,
                    display: 'flex',
                    flexDirection: 'column',

                    // top: 0,
                }}
            >
                {isUndefinedOrNullOrStringEmpty(localSearchValue) ? (
                    <div style={{ width: '100%', height: '100%', padding: '0px 10px' }}>
                        <NuggDexSearchListMobile2 />
                    </div>
                ) : agg.length === 0 ? (
                    <Text textStyle={styles.resultText}>
                        {isUndefinedOrNullOrStringEmpty(localSearchValue)
                            ? t`Type a number`
                            : loading
                            ? t`Loading`
                            : t`No results`}
                    </Text>
                ) : (
                    <SearchBarResults tokens={[...searchedItemsData, ...searchedNuggsData]} />
                )}
            </div>
        </animated.div>
    );
};

export default NuggDexSearchBarMobile;
